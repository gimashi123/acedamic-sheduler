import express from 'express';
import { createSubject, getAllSubjects, getLecturerSubjects, updateSubject, deleteSubject } from '../controller/subject.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';

const router = express.Router();

// Route to create a new subject (Lecturer only)
router.post('/', 
  authenticateToken, 
  authorizeRole(['Lecturer']), 
  createSubject
);

// Route to get all subjects (Admin only)
router.get('/all', 
  authenticateToken, 
  authorizeRole(['Admin']), 
  getAllSubjects
);

// Route to get the logged-in lecturer's subjects
router.get('/my-subjects', 
  authenticateToken, 
  authorizeRole(['Lecturer']), 
  getLecturerSubjects
);

// Route to update a subject
router.put('/:id', 
  authenticateToken, 
  authorizeRole(['Lecturer', 'Admin']), 
  updateSubject
);

// Route to delete a subject
router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['Lecturer', 'Admin']), 
  deleteSubject
);

export default router; 