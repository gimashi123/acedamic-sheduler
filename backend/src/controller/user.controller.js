import UserRequest, { REQUEST_STATUS } from '../models/user_request.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User, { ROLES } from '../models/user.model.js';
import RemovedUser from '../models/removed_user.model.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { userResponseDto } from '../dto/user.response.dto.js';
import { hashPassword } from '../middleware/jwt.middleware.js';

dotenv.config();

const senderEmail = process.env.EMAIL_SERVICE_EMAIL;
const senderPassword = process.env.EMAIL_SERVICE_PASSWORD;

// Admin registers an approved user
export const registerUser = async (req, res) => {
  try {
    const { requestId } = req.params;
    // Find approved request

    const formRequest = await UserRequest.findById(requestId);
    if (!formRequest || formRequest.status !== REQUEST_STATUS.APPROVED) {
      return errorResponse(
        res,
        'Invalid user request or not approved',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Generate default password
    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(defaultPassword);

    // Create user
    const newUser = new User({
      firstName: formRequest.firstName,
      lastName: formRequest.lastName,
      email: formRequest.email,
      password: hashedPassword,
      role: formRequest.role,
    });

    await newUser.save();

    // Send email with credentials
    await sendEmail(
      formRequest.email,
      'Your Account Details',
      `Username: ${formRequest.email}\nPassword: ${defaultPassword}`,
    );

    //update isEmailSent field
    await UserRequest.findByIdAndUpdate(requestId, { isEmailSent: true });

    successResponse(
      res,
      'User registered successfully',
      HTTP_STATUS.CREATED,
      userResponseDto(newUser),
    );
  } catch (error) {
    console.error('Error registering user:', error);
    errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};

// Helper function to send emails
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: senderEmail, pass: senderPassword },
  });

  await transporter.sendMail({
    from: senderEmail,
    to,
    subject,
    text,
  });
};

// Get all registered users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin registers another admin
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        res,
        'Email already exists',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create Admin User
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: ROLES.ADMIN, // Ensure role is set to Admin
    });

    await newAdmin.save();

    successResponse(
      res,
      'Admin registered successfully',
      HTTP_STATUS.CREATED,
      userResponseDto(newAdmin),
    );
  } catch (error) {
    errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role parameter
    if (!Object.values(ROLES).includes(role)) {
      return errorResponse(
        res,
        'Invalid role specified',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const users = await User.find({ role }).select('-password -refreshToken');

    // Return data in the format expected by the frontend
    successResponse(
      res,
      `${role}s retrieved successfully`,
      HTTP_STATUS.OK,
      users,
    );
  } catch (error) {
    console.error(`Error getting users by role ${req.params.role}:`, error);
    errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};

// Remove a user
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'Not specified' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Send email notification to user
    await sendEmail(
      user.email,
      'Account Removal Notification',
      `Dear ${user.firstName} ${user.lastName},\n\nYour account has been removed from the Academic Scheduler System. Your user credentials are no longer valid for this website.\n\nIf you believe this is a mistake, please contact the administrator.\n\nRegards,\nAcademic Scheduler Admin Team`,
    );

    // Get admin user info safely
    const adminId = req.user ? req.user._id : null;

    // Create record of removed user
    const removedUser = new RemovedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      removedBy: adminId, // ID of admin who removed the user
      reason,
    });

    await removedUser.save();

    // Delete the user
    await User.findByIdAndDelete(userId);

    successResponse(res, 'User removed successfully', HTTP_STATUS.OK, {
      userId,
    });
  } catch (error) {
    console.error('Error removing user:', error);
    errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};

// Get removed users
export const getRemovedUsers = async (req, res) => {
  try {
    console.log('Attempting to fetch removed users');

    // First try to find all removed users
    const removedUsers = await RemovedUser.find().sort({ removedAt: -1 });

    console.log(`Found ${removedUsers.length} removed user records`);

    // Process each user to ensure proper formatting, even if the admin user is no longer in the system
    const processedUsers = await Promise.all(
      removedUsers.map(async (user) => {
        try {
          // Convert to plain object for manipulation
          const userObj = user.toObject();

          // Handle the removedBy relationship
          if (userObj.removedBy) {
            try {
              // Try to find the admin who removed this user
              const adminUser = await User.findById(userObj.removedBy)
                .select('firstName lastName email')
                .lean();

              if (adminUser) {
                // If admin exists, use their info
                userObj.removedBy = adminUser;
              } else {
                // Admin no longer exists, provide default info
                userObj.removedBy = {
                  _id: userObj.removedBy.toString(),
                  firstName: 'Former',
                  lastName: 'Admin',
                  email: 'admin@system.com',
                };
              }
            } catch (err) {
              console.log('Error finding admin user:', err);
              // Set default admin info if lookup fails
              userObj.removedBy = {
                _id: 'unknown',
                firstName: 'System',
                lastName: 'Admin',
                email: 'admin@system.com',
              };
            }
          } else {
            // If no removedBy field, set default
            userObj.removedBy = {
              _id: 'unknown',
              firstName: 'System',
              lastName: 'Admin',
              email: 'admin@system.com',
            };
          }

          return userObj;
        } catch (err) {
          console.error('Error processing removed user:', err);
          // Return a safe default object if processing fails
          return {
            _id: user._id || 'unknown',
            firstName: user.firstName || 'Unknown',
            lastName: user.lastName || 'User',
            email: user.email || 'unknown@example.com',
            role: user.role || 'Unknown',
            removedAt: user.removedAt || new Date(),
            reason: user.reason || 'Not specified',
            removedBy: {
              _id: 'unknown',
              firstName: 'System',
              lastName: 'Admin',
              email: 'admin@system.com',
            },
          };
        }
      }),
    );

    // Always return a valid array
    successResponse(
      res,
      'Removed users retrieved successfully',
      HTTP_STATUS.OK,
      processedUsers || [],
    );
  } catch (error) {
    console.error('Error getting removed users:', error);
    // Return empty array instead of error for better UX
    successResponse(
      res,
      'Unable to retrieve removed users, returning empty list',
      HTTP_STATUS.OK,
      [],
    );
  }
};

// Update user details (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email } = req.body;

    // Validate inputs
    const errors = {};

    if (!firstName || firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!lastName || lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    }

    // If any required fields are missing, return error
    if (Object.keys(errors).length > 0) {
      return errorResponse(
        res,
        'Validation failed: Missing required fields',
        HTTP_STATUS.BAD_REQUEST,
        { validationErrors: errors },
      );
    }

    // Validate names (allow only letters and numbers)
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    if (!nameRegex.test(firstName)) {
      errors.firstName = 'First name can only contain letters and numbers';
    }

    if (!nameRegex.test(lastName)) {
      errors.lastName = 'Last name can only contain letters and numbers';
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    // If any validation errors, return them
    if (Object.keys(errors).length > 0) {
      return errorResponse(
        res,
        'Validation failed: Format errors',
        HTTP_STATUS.BAD_REQUEST,
        { validationErrors: errors },
      );
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if email is changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(
          res,
          'Email is already in use',
          HTTP_STATUS.BAD_REQUEST,
          {
            validationErrors: {
              email: 'This email is already in use by another user',
            },
          },
        );
      }
      user.email = email;
    }

    // Update fields
    user.firstName = firstName;
    user.lastName = lastName;

    await user.save();

    return successResponse(
      res,
      'User updated successfully',
      HTTP_STATUS.OK,
      userResponseDto(user),
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};
