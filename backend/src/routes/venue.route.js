import { Router } from 'express';
import { 
    getAllVenues, 
    getVenueById, 
    createVenue, 
    updateVenue, 
    deleteVenue 
} from '../controller/venue.controller.js';
import { authenticateToken, isAdmin } from '../middleware/jwt.middleware.js';

const router = Router();

// Get all venues - accessible by anyone with a valid token
router.get('/', authenticateToken, getAllVenues);

// Get a single venue by ID - accessible by anyone with a valid token
router.get('/:id', authenticateToken, getVenueById);

// Protected admin-only routes
router.post('/', authenticateToken, isAdmin, createVenue);
router.put('/:id', authenticateToken, isAdmin, updateVenue);
router.delete('/:id', authenticateToken, isAdmin, deleteVenue);

export default router;