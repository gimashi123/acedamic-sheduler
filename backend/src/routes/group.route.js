import { Router } from 'express';
import { 
    getAllGroups, 
    getGroupById, 
    createGroup, 
    updateGroup, 
    deleteGroup,
    addStudentsToGroup,
    removeStudentFromGroup,
    getAvailableStudents,
    getFaculties,
    getDepartments,
    getGroupsByType,
    getGroupsByFaculty,
    getGroupsByYearAndSemester
} from '../controller/group.controller.js';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';

const router = Router();

// All group routes require authentication
router.use(authenticateToken);

// Reference data routes (available to all authenticated users)
router.get('/faculties', getFaculties);
router.get('/faculties/:faculty/departments', getDepartments);

// Group filtering routes (available to all authenticated users)
router.get('/type/:type', getGroupsByType);
router.get('/faculty/:faculty', getGroupsByFaculty);
router.get('/year/:year/semester/:semester', getGroupsByYearAndSemester);

// Get all groups and available students - accessible by anyone with a valid token
router.get('/', getAllGroups);
router.get('/available-students', getAvailableStudents);
router.get('/:id', getGroupById);

// Protected admin-only routes
router.post('/', isAdmin, createGroup);
router.put('/:id', isAdmin, updateGroup);
router.delete('/:id', isAdmin, deleteGroup);

// Student management in groups - admin only
router.post('/:id/students', isAdmin, addStudentsToGroup);
router.delete('/:id/students/:studentId', isAdmin, removeStudentFromGroup);

export default router;