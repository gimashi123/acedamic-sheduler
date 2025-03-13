import express from 'express';
import {
  createVenue,
  deleteVenue,
  getVenueById,
  getVenues,
  updateVenue,
} from '../controller/venue.controller.js';

const router = express.Router();

router.get('/get', getVenues);
router.get('/:id', getVenueById);
router.post('/create-venue', createVenue);
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;
