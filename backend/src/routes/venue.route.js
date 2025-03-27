import express from "express";
import { createVenue, deleteVenue, getVenueById, getVenues, updateVenue } from "../controller/venue.controller.js";

const router = express.Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/', createVenue); // if an error thows up change this to '/'
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;