import express from 'express';
import { 
  addSubject, 
  getSubjects, 
  getSubjectById, 
  updateSubject, 
  deleteSubject, 
  getLecturerSubjects 
} from '../controller/subject.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Admin only routes
// Route to add a new subject
router.post('/add', authenticateToken, authorizeRole(['Admin']), addSubject);

// Route to update a subject
router.put('/update/:id', authenticateToken, authorizeRole(['Admin']), updateSubject);

// Route to delete a subject
router.delete('/delete/:id', authenticateToken, authorizeRole(['Admin']), deleteSubject);

// Routes accessible to all authenticated users
// Route to get all subjects
router.get('/get/all', authenticateToken, getSubjects);

// Route to get a specific subject
router.get('/get/:id', authenticateToken, getSubjectById);

// Route to get subjects for a specific lecturer
router.get('/lecturer', authenticateToken, getLecturerSubjects);

export default router; 