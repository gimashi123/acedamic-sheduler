import express from 'express';
import { registerAdmin, registerUser } from '../controller/user.controller.js';

const router = express.Router();

// Route to register a new user (by Admin)
router.post('/register-user', registerUser);

router.post('/register-admin', registerAdmin);

// Route to send credentials to a user via email (Admin only)
//router.post('/send-credentials', sendCredentials);

export default router;
