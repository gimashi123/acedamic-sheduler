import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';
import {
  getAllSubjectAssignments,
  getLecturerAssignments,
  getSubjectAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAvailableLecturers,
  getCurrentAssignments
} from '../controller/subject_assignment.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Routes accessible to all authenticated users
router.get('/', getAllSubjectAssignments);
router.get('/current', getCurrentAssignments);
router.get('/lecturer/:lecturerId', getLecturerAssignments);
router.get('/subject/:subjectId', getSubjectAssignments);
router.get('/available-lecturers', getAvailableLecturers);
router.get('/:id', getAssignmentById);

// Admin-only routes
router.post('/', isAdmin, createAssignment);
router.put('/:id', isAdmin, updateAssignment);
router.delete('/:id', isAdmin, deleteAssignment);

export default router; 