import express from 'express';
import {
    getTimetables,
    createTimetable,
    getTimetableById,
    updateTimetable,
    deleteTimetable,
    addSlotToTimetable,
    updateSlotInTimetable,
    deleteSlotFromTimetable
} from '../controller/timetable.controller.js';

const router = express.Router();

// Timetable CRUD
router.get('/get/all',            getTimetables);
router.get('/get/:id',            getTimetableById);
router.post('/create',            createTimetable);
router.put('/update/:id',         updateTimetable);
router.delete('/delete/:id',      deleteTimetable);

// Slot management within a timetable
router.post('/:id/slots',             addSlotToTimetable);
router.put('/:id/slots/:slotId',      updateSlotInTimetable);
router.delete('/:id/slots/:slotId',   deleteSlotFromTimetable);
export default router;
