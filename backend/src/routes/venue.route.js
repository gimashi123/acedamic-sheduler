import express from 'express';
import {
  createVenue,
  deleteVenue,
  getVenueById,
  getVenues,
  getVenuesOptions,
  updateVenue,
} from '../controller/venue.controller.js';

const router = express.Router();

router.post('/add', createVenue);
router.get('/get/all', getVenues);
router.get('/get/options', getVenuesOptions);
router.get('/get/:id', getVenueById);
router.put('/update/:id', updateVenue);
router.delete('/delete/:id', deleteVenue);

export default router;
