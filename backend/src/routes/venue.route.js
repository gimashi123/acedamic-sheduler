import express from "express";
import { createVenue, deleteVenue, getVenueById, getVenues, updateVenue } from "../controller/venue.controller.js";

const router = express.Router();

router.get('/get/all', getVenues);
router.get('/:id', getVenueById);
router.post('/create-venue', createVenue);
router.put('/update/:id', updateVenue);
router.delete('/delete/:id', deleteVenue);

export default router;