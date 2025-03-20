import UserRequest, { REQUEST_STATUS } from '../models/user_request.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User, { ROLES } from '../models/user.model.js';
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
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const users = await User.find({ role }).select('-password -refreshToken');
    
    // Return data in the format expected by the frontend
    successResponse(
      res,
      `${role}s retrieved successfully`,
      HTTP_STATUS.OK,
      users
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
    
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    // Send email notification to user
    await sendEmail(
      user.email,
      'Account Removal Notification',
      `Dear ${user.firstName} ${user.lastName},\n\nYour account has been removed from the Academic Scheduler System. Your user credentials are no longer valid for this website.\n\nIf you believe this is a mistake, please contact the administrator.\n\nRegards,\nAcademic Scheduler Admin Team`
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    successResponse(
      res,
      'User removed successfully',
      HTTP_STATUS.OK,
      { userId }
    );
  } catch (error) {
    console.error('Error removing user:', error);
    errorResponse(res, 'Server error', HTTP_STATUS.SERVER_ERROR, error);
  }
};
