import express from 'express';
import {
  login,
  register,
  refreshToken,
  changePassword,
  resetPassword,
  getUserDetails,
} from '../controller/auth.controller.js';
import { authenticateToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Route for user login
router.post('/login', login);

// Route for registering a new user
router.post('/register', register);

// Route for refreshing access token
router.post('/refresh-token', refreshToken);

// Route for changing password (protected)
router.post('/change-password', authenticateToken, changePassword);

// Route for resetting password (protected)
router.post('/reset-password', authenticateToken, resetPassword);

// Get current user details (useful for token validation)
router.get('/me', authenticateToken, getUserDetails);

export default router;
