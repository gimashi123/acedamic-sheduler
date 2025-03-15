import express from 'express';
import {
  createRequest,
  getAllRequests,
  getRequestsByStatus,
  getRequestsByRole,
  updateRequestStatus,
  getRequestStatus,
} from '../controller/request.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';
import { ROLES } from '../models/user.model.js';

const router = express.Router();

// Public route to submit a registration request
router.post('/submit', createRequest);

// Public route to check request status by email
router.get('/status/:email', getRequestStatus);

// Admin routes (protected)
router.get(
  '/all',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getAllRequests
);

router.get(
  '/status/:status',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getRequestsByStatus
);

router.get(
  '/role/:role',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getRequestsByRole
);

router.put(
  '/:requestId',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  updateRequestStatus
);

export default router; 