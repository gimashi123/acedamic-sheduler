import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { errorResponse, HTTP_STATUS } from '../config/http.config.js';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware to verify token
export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token)
    return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Access Denied');

  try {
    req.user = jwt.verify(token, SECRET_KEY); // { userId, role }
    next();
  } catch (err) {
    return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, 'Access Denied');
  }
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
