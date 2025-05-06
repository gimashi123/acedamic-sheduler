import express from 'express';
import {
  getTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  updateTimetableSubjects,
  addScheduleEntry,
  getTimetableContent,
  deleteScheduleEntry
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

// New routes for timetable content management

// Get timetable content including subjects and schedule
router.get('/:id/content', auth, getTimetableContent);

// Add or update subjects in a timetable
router.post('/:id/subjects', auth, updateTimetableSubjects);

// Add a schedule entry to a timetable
router.post('/:id/schedule', auth, addScheduleEntry);

// Delete a schedule entry from a timetable
router.delete('/:id/schedule/:entryId', auth, deleteScheduleEntry);

export default router;