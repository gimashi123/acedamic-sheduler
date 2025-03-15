import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { errorResponse, HTTP_STATUS } from '../config/http.config.js';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to verify token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return errorResponse(res, 'Access Denied - No token provided', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return errorResponse(res, 'Access Denied - Invalid token', HTTP_STATUS.UNAUTHORIZED);
  }
};

// Role-based authorization middleware
export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized - User not authenticated', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden - Insufficient permissions', HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};

// Generate Access Token
export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
    expiresIn: '1h',
  });
};

// Generate Refresh Token
export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '7d' });
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Admin authorization middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Unauthorized - User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  if (req.user.role !== 'Admin') {
    return errorResponse(res, 'Forbidden - Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  next();
};
