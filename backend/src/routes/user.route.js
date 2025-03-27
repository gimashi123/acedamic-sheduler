import express from 'express';
import {
  registerAdmin,
  registerUser,
  getUsers,
} from '../controller/user.controller.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middleware/jwt.middleware.js';
import { ROLES } from '../models/user.model.js';

const router = express.Router();

// Route to register a new user (by Admin)
router.post(
  '/register-user/:requestId',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  registerUser,
);

// Route to register an admin
router.post('/register-admin', registerAdmin);

// Route to get all users (Admin only)
router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN]), getUsers);

// Route to send credentials to a user via email (Admin only)
//router.post('/send-credentials', sendCredentials);

export default router;
