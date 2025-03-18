import express from 'express';
import {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from '../controller/subject.controller.js';
import { authenticateToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, addSubject);
router.get('/', getSubjects);
router.put('/:id', authenticateToken, updateSubject);
router.delete('/:id', authenticateToken, deleteSubject);

export default router;
