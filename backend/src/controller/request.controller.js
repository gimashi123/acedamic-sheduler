import UserRequest, { REQUEST_STATUS } from '../models/user_request.model.js';
import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User from '../models/user.model.js';
import { hashPassword } from '../middleware/jwt.middleware.js';
import emailService from '../services/email.service.js';
import dotenv from 'dotenv';
import { emailSettings } from './settings.controller.js';

dotenv.config();

// Submit a new registration request
export const createRequest = async (req, res) => {
  try {
    const { firstName, lastName, email, role, additionalDetails } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !role) {
      return errorResponse(
        res,
        'All required fields must be provided',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if email already exists in users
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        res,
        'Email already registered as a user',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if request already exists
    const existingRequest = await UserRequest.findOne({ email });
    if (existingRequest) {
      return errorResponse(
        res,
        'A request with this email already exists',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Create a new request
    const newRequest = new UserRequest({
      firstName,
      lastName,
      email,
      role,
      additionalDetails,
      status: REQUEST_STATUS.PENDING,
    });

    await newRequest.save();

    return successResponse(
      res,
      'Registration request submitted successfully. Please wait for admin approval.',
      HTTP_STATUS.CREATED,
      { requestId: newRequest._id }
    );
  } catch (error) {
    console.error('Error creating request:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get all requests (Admin only)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await UserRequest.find().sort({ createdAt: -1 });
    return successResponse(
      res,
      'Requests retrieved successfully',
      HTTP_STATUS.OK,
      requests
    );
  } catch (error) {
    console.error('Error getting requests:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get requests by status (Admin only)
export const getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!Object.values(REQUEST_STATUS).includes(status)) {
      return errorResponse(
        res,
        'Invalid status',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const requests = await UserRequest.find({ status }).sort({ createdAt: -1 });
    return successResponse(
      res,
      `${status} requests retrieved successfully`,
      HTTP_STATUS.OK,
      requests
    );
  } catch (error) {
    console.error('Error getting requests by status:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get requests by role (Admin only)
export const getRequestsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['Lecturer', 'Student'].includes(role)) {
      return errorResponse(
        res,
        'Invalid role',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const requests = await UserRequest.find({ role }).sort({ createdAt: -1 });
    return successResponse(
      res,
      `${role} requests retrieved successfully`,
      HTTP_STATUS.OK,
      requests
    );
  } catch (error) {
    console.error('Error getting requests by role:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Update request status (Admin only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    if (!Object.values(REQUEST_STATUS).includes(status)) {
      return errorResponse(
        res,
        'Invalid status',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const request = await UserRequest.findById(requestId);
    if (!request) {
      return errorResponse(
        res,
        'Request not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Update request status
    request.status = status;
    
    if (status === REQUEST_STATUS.APPROVED) {
      request.isApproved = true;
      
      // Check if user already exists with this email
      const existingUser = await User.findOne({ email: request.email });
      
      if (existingUser) {
        console.log(`User with email ${request.email} already exists. Skipping user creation.`);
      } else {
        // Generate default password
        const defaultPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(defaultPassword);

        // Create user
        const newUser = new User({
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          password: hashedPassword,
          role: request.role,
          isFirstLogin: true,
          passwordChangeRequired: true,
          defaultPassword: defaultPassword, // Store the plain text password temporarily
        });

        await newUser.save();

        // Store the default password in the request for the response
        request.defaultPassword = defaultPassword;

        // Send email notification using our email service
        try {
          // Generate HTML content for the email
          const htmlContent = emailService.generateAccountCreationHtml(
            request.firstName,
            request.lastName,
            request.email,
            defaultPassword
          );

          // Plain text version as fallback
          const textContent = `Dear ${request.firstName} ${request.lastName},

Your account request has been approved. You can now log in to the Academic Scheduler system with the following credentials:

Username: ${request.email}
Password: ${defaultPassword}

Please change your password after your first login.

Best regards,
Academic Scheduler Team`;

          // Send the email with both HTML and plain text versions
          const emailResult = await emailService.sendEmail(
            request.email,
            'Your Account Has Been Approved',
            textContent,
            htmlContent
          );

          // Mark email as sent if successful
          request.isEmailSent = emailResult.success;
          
          // Log the result
          if (emailResult.success) {
            console.log(`Approval email sent to ${request.email} using provider: ${emailResult.provider}`);
          } else {
            console.warn(`Could not send approval email to ${request.email}: ${emailResult.message}`);
          }
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Continue processing despite email failure
        }
      }
    } else if (status === REQUEST_STATUS.REJECTED) {
      // Send rejection email using our email service
      try {
        // Generate HTML content for the email
        const htmlContent = emailService.generateRejectionHtml(
          request.firstName,
          request.lastName,
          reason
        );

        // Plain text version as fallback
        let textContent = `Dear ${request.firstName} ${request.lastName},

We regret to inform you that your account request for the Academic Scheduler system has been rejected.`;

        // Add reason if provided
        if (reason) {
          textContent += `\n\nReason: ${reason}`;
        }

        textContent += `\n\nIf you believe this is an error or if you have any questions, please contact the administrator.

Best regards,
Academic Scheduler Team`;

        // Send the email with both HTML and plain text versions
        const emailResult = await emailService.sendEmail(
          request.email,
          'Your Account Request Has Been Rejected',
          textContent,
          htmlContent
        );

        // Mark email as sent if successful
        request.isEmailSent = emailResult.success;
        
        // Log the result
        if (emailResult.success) {
          console.log(`Rejection email sent to ${request.email} using provider: ${emailResult.provider}`);
        } else {
          console.warn(`Could not send rejection email to ${request.email}: ${emailResult.message}`);
        }
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Continue processing despite email failure
      }
    }

    await request.save();

    // Create response object with additional info if needed
    const responseData = {
      ...request.toObject(),
      // Include the default password in the response if it exists and was just created
      defaultPassword: request.defaultPassword || undefined
    };

    return successResponse(
      res,
      `Request ${status.toLowerCase()} successfully`,
      HTTP_STATUS.OK,
      responseData
    );
  } catch (error) {
    console.error('Error updating request status:', error);
    return errorResponse(
      res,
      'Server error: ' + error.message,
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Get request status by email (for users to check their request status)
export const getRequestStatus = async (req, res) => {
  try {
    const { email } = req.params;
    
    const request = await UserRequest.findOne({ email });
    if (!request) {
      return errorResponse(
        res,
        'No request found for this email',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return successResponse(
      res,
      'Request status retrieved successfully',
      HTTP_STATUS.OK,
      {
        status: request.status,
        createdAt: request.createdAt,
      }
    );
  } catch (error) {
    console.error('Error getting request status:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Helper function to send emails
const sendEmail = async (to, subject, text) => {
  // Check if email is enabled in settings
  if (process.env.EMAIL_ENABLED !== 'true' && !emailSettings.isEnabled) {
    console.warn('Email notifications are disabled in settings. Skipping email sending.');
    return false;
  }

  // Use settings from settings controller or fallback to env variables
  const senderEmail = emailSettings.email || process.env.EMAIL_SERVICE_EMAIL;
  const senderPassword = emailSettings.password || process.env.EMAIL_SERVICE_PASSWORD;
  
  // Check if email credentials are set
  if (!senderEmail || !senderPassword) {
    console.warn('Email credentials not set. Skipping email sending.');
    return false; // Return false to indicate email was not sent
  }
  
  try {
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
    
    return true; // Return true to indicate email was sent
  } catch (error) {
    console.error('Error sending email:', error);
    return false; // Return false to indicate email was not sent
  }
};
