import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User, { ROLES } from '../models/user.model.js';
import UserRequest, { REQUEST_STATUS } from '../models/user_request.model.js';
import { userLoginResponseDTO, userResponseDto } from '../dto/user.response.dto.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../middleware/jwt.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@academicscheduler.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Initialize admin account
export const initializeAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!adminExists) {
      console.log('Creating admin account...');
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: ROLES.ADMIN,
      });
      
      await admin.save();
      console.log('Admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(
        res,
        'Email and password are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Check if there's a pending request
      const pendingRequest = await UserRequest.findOne({ email });
      if (pendingRequest) {
        return errorResponse(
          res,
          `Your registration request is ${pendingRequest.status.toLowerCase()}. Please wait for admin approval.`,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
      
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Update refresh token in database
    user.refreshToken = refreshToken;
    
    // If this is the first login, mark it as no longer the first login
    // but keep the passwordChangeRequired flag
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
    }
    
    await user.save();

    // Include the passwordChangeRequired flag in the response
    return successResponse(
      res,
      'Login Successful',
      HTTP_STATUS.OK,
      {
        ...userLoginResponseDTO(user, accessToken, refreshToken),
        passwordChangeRequired: user.passwordChangeRequired,
        defaultPassword: user.defaultPassword
      },
    );
  } catch (e) {
    console.error('Login error:', e);
    return errorResponse(
      res,
      'Internal Server Error',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return errorResponse(
        res,
        'All fields are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        res,
        'Email already exists',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role as STUDENT if not specified
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || ROLES.STUDENT,
    });

    await newUser.save();

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    
    // Update refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save();

    return successResponse(
      res,
      'User registered successfully',
      HTTP_STATUS.CREATED,
      userLoginResponseDTO(newUser, accessToken),
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR,
    );
  }
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return errorResponse(
        res,
        'Refresh token is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return errorResponse(
        res,
        'Invalid refresh token',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(user);
    
    return successResponse(
      res,
      'Token refreshed successfully',
      HTTP_STATUS.OK,
      { accessToken }
    );
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        'Current password and new password are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (newPassword.length < 6) {
      return errorResponse(
        res,
        'New password must be at least 6 characters long',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    const isPasswordCorrect = await comparePassword(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return errorResponse(
        res,
        'Current password is incorrect',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    
    // If the user was required to change their password, mark it as no longer required
    if (user.passwordChangeRequired) {
      user.passwordChangeRequired = false;
      // Clear the stored default password for security
      user.defaultPassword = null;
    }
    
    await user.save();
    
    return successResponse(
      res,
      'Password changed successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(
      res,
      'Server error',
      HTTP_STATUS.SERVER_ERROR
    );
  }
};
