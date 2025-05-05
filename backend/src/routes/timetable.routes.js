import express from 'express';
import {
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable
} from '../controller/timetable.controller.js';
import { authenticateToken as auth } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Get all timetables
router.get('/get/all', getTimetables);

// Get a specific timetable by ID
router.get('/get/:id', getTimetableById);

// Create a new timetable (requires authentication)
router.post('/create', auth, createTimetable);

// Update an existing timetable (requires authentication)
router.put('/update/:id', auth, updateTimetable);

// Delete a timetable (requires authentication)
router.delete('/delete/:id', auth, deleteTimetable);

export default router;