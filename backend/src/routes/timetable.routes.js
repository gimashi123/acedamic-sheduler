import express from 'express';
import { 
    generateTimetable, 
    generateAllTimetables, 
    getAllTimetables, 
    getTimetablesByGroup, 
    getTimetableById, 
    updateTimetableStatus, 
    deleteTimetable 
} from '../controller/timetable.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate timetable for a single group (Admin only)
router.post(
    '/generate', 
    authorizeRole([ROLES.ADMIN]), 
    generateTimetable
);

// Generate timetables for all groups (Admin only)
router.post(
    '/generate-all', 
    authorizeRole([ROLES.ADMIN]), 
    generateAllTimetables
);

// Get all timetables (Admin only)
router.get(
    '/', 
    authorizeRole([ROLES.ADMIN]), 
    getAllTimetables
);

// Get timetables by group
router.get(
    '/group/:groupId', 
    getTimetablesByGroup
);

// Get timetable by id
router.get(
    '/:id', 
    getTimetableById
);

// Update timetable status (Admin only)
router.patch(
    '/:id/status', 
    authorizeRole([ROLES.ADMIN]), 
    updateTimetableStatus
);

// Delete timetable (Admin only)
router.delete(
    '/:id', 
    authorizeRole([ROLES.ADMIN]), 
    deleteTimetable
);

export default router; 