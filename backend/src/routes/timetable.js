import express from 'express';
import {
    getTimetables,
    createTimetable,
    getTimetableById,
    deleteTimetable,updateTimetable

} from '../controller/timetable.controller.js';

const router = express.Router();

router.get('/get/all', getTimetables);
router.get('/get/:id',getTimetableById);
router.post('/create', createTimetable);
router.put('/update/:id', updateTimetable);
router.delete('/delete/:id', deleteTimetable);

export default router;
