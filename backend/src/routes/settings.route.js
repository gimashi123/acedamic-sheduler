import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';
import { 
  getEmailSettings,
  updateEmailSettings,
  testEmailSettings
} from '../controller/settings.controller.js';

const router = express.Router();

// All settings routes require admin access
router.use(authenticateToken);
router.use(isAdmin);

// Email settings routes
router.get('/email', getEmailSettings);
router.post('/email', updateEmailSettings);
router.post('/email/test', testEmailSettings);

export default router; 