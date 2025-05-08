import express from 'express';
import {
  registerAdmin,
  registerUser,
  getUsers,
  getUsersByRole,
  removeUser,
  getRemovedUsers,
  updateUser,
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
router.post(
  '/register-admin',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  registerAdmin,
);

// Route to get all users (Admin only)
router.get('/', authenticateToken, authorizeRole([ROLES.ADMIN]), getUsers);

// Route to get users by role (Admin only)
router.get(
  '/by-role/:role',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getUsersByRole,
);

// Route to get removed users (Admin only)
router.get(
  '/removed',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getRemovedUsers,
);

// Route to remove a user (Admin only)
router.delete(
  '/:userId',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  removeUser,
);

// Route to update user details (Admin only)
router.put(
  '/:userId',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  updateUser,
);

// Route to send credentials to a user via email (Admin only)
//router.post('/send-credentials', sendCredentials);

export default router;
