import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';
import {
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
} from '../controller/settings.controller.js';

const router = express.Router();

// All settings routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Email settings routes
router.get('/email', getEmailSettings);
router.post('/email', updateEmailSettings);
router.post('/test-email', sendTestEmail);

export default router; 