import express from 'express';
import {
  addSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  getSubjectOptions,
} from '../controller/subject.controller.js';
import { authenticateToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post('/add', addSubject);
router.get('/get/all', getSubjects);
router.get('/get/options', getSubjectOptions);
router.put('/update/:id', updateSubject);
router.delete('/delete/:id', deleteSubject);

export default router;
