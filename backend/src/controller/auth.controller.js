import {
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from '../config/http.config.js';
import User, { ROLES } from '../models/user.model.js';
import { userLoginResponseDTO, userResponseDto } from '../dto/user.response.dto.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../middleware/jwt.middleware.js';

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
    await user.save();

    return successResponse(
      res,
      'Login Successful',
      HTTP_STATUS.OK,
      userLoginResponseDTO(user, accessToken),
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
