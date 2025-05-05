import express from 'express';
import { addSubject, getSubjects, getSubjectById, updateSubject, deleteSubject } from '../controller/subject.controller.js';

const router = express.Router();

// Route to add a new subject
router.post('/add', addSubject);

// Route to get all subjects
router.get('/get/all', getSubjects);

// Route to get a specific subject
router.get('/get/:id', getSubjectById);

// Route to update a subject
router.put('/update/:id', updateSubject);

// Route to delete a subject
router.delete('/delete/:id', deleteSubject);

export default router; 