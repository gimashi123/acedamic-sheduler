import express from 'express';
import { 
  uploadProfilePicture, 
  deleteProfilePicture, 
  getProfilePicture,
  updateUserProfilePicture
} from '../controller/profile.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';
import { ROLES } from '../models/user.model.js';

const router = express.Router();

// Routes for all authenticated users
router.get('/picture', authenticateToken, getProfilePicture);
router.post('/picture/upload', authenticateToken, uploadProfilePicture);
router.delete('/picture', authenticateToken, deleteProfilePicture);

// Admin-only routes
router.post(
  '/picture/user/:userId/upload', 
  authenticateToken, 
  authorizeRole([ROLES.ADMIN]), 
  updateUserProfilePicture
);

export default router; 