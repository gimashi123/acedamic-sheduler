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

dotenv.config();

const senderEmail = process.env.EMAIL_SERVICE_EMAIL;
const senderPassword = process.env.EMAIL_SERVICE_PASSWORD;

//const bcrypt = import('bcryptjs');

// Admin registers an approved user
export const registerUser = async (req, res) => {
  try {
    const { requestId } = req.param;
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
    // const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create user
    const newUser = new User({
      firstName: formRequest.firstName,
      lastName: formRequest.lastName,
      email: formRequest.email,
      password: defaultPassword,
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
      newUser,
    );
  } catch (error) {
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

    // Hash the provided password
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin User
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password,
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
