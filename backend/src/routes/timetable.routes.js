import express from 'express';
import { 
  getAllTimetables, 
  getTimetableByGroup, 
  generateConstraintTimetable, 
  generateAITimetable, 
  finalizeTimetable 
} from '../controller/timetable.controller.js';
import { authenticateToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Get all timetables
router.get('/', authenticateToken, getAllTimetables);

// Get timetable by group ID
router.get('/group/:groupId', authenticateToken, getTimetableByGroup);

// Generate timetable using constraint-based approach
router.post('/generate/constraint', authenticateToken, generateConstraintTimetable);

// Generate timetable using AI
router.post('/generate/ai', authenticateToken, generateAITimetable);

// Finalize timetable
router.post('/finalize', authenticateToken, finalizeTimetable);

export default router; 