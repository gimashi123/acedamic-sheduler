import express from 'express';
import { 
  addStudent, 
  getAllStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent 
} from '../controller/student.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/jwt.middleware.js';
import { ROLES } from '../models/user.model.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Admin & Lecturer routes
router.post('/add', authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), addStudent);
router.put('/update/:id', authorizeRole([ROLES.ADMIN, ROLES.LECTURER]), updateStudent);
router.delete('/delete/:id', authorizeRole([ROLES.ADMIN]), deleteStudent);

// Routes accessible to all authenticated users
router.get('/get/all', getAllStudents);
router.get('/get/:id', getStudentById);

export default router;