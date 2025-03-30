import { Router } from 'express';
import { 
  getAllSubjects, 
  getSubjectById, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../controller/subject.controller.js';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';

const router = Router();

// Get all subjects - accessible by anyone with a valid token
router.get('/', authenticateToken, getAllSubjects);

// Get a single subject by ID - accessible by anyone with a valid token
router.get('/:id', authenticateToken, getSubjectById);

// Protected admin-only routes
router.post('/', authenticateToken, isAdmin, createSubject);
router.put('/:id', authenticateToken, isAdmin, updateSubject);
router.delete('/:id', authenticateToken, isAdmin, deleteSubject);

export default router; 