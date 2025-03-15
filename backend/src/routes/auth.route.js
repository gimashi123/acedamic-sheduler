import express from 'express';
import { login, refreshToken, changePassword } from '../controller/auth.controller.js';
import { authenticateToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Route for user login
router.post('/login', login);

// Route for refreshing access token
router.post('/refresh-token', refreshToken);

// Route for changing password (protected)
router.post('/change-password', authenticateToken, changePassword);

export default router;
