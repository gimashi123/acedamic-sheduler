import express from 'express';
import {
  createRequest,
  getAllRequests,
  getRequestsByStatus,
  getRequestsByRole,
  updateRequestStatus,
  getRequestStatus,
  checkRequestStatusByEmail,
  approveRequest,
  rejectRequest,
} from '../controller/request.controller.js';
import {
  authenticateToken,
  authorizeRole,
} from '../middleware/jwt.middleware.js';
import { ROLES } from '../models/user.model.js';
import { REQUEST_STATUS } from '../models/user_request.model.js';

const router = express.Router();

// Public route to submit a registration request
router.post('/submit', createRequest);

// Public route to check request status by email
router.get('/status-by-email/:email', checkRequestStatusByEmail);

// Admin routes (protected)
router.get(
  '/all',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getAllRequests,
);

router.get(
  '/status/:status',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getRequestsByStatus,
);

router.get(
  '/role/:role',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  getRequestsByRole,
);

router.put(
  '/:requestId',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  updateRequestStatus,
);

// Approve and reject request routes
router.post(
  '/approve/:id',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  approveRequest,
);

router.post(
  '/reject/:id',
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  rejectRequest,
);

export default router;
