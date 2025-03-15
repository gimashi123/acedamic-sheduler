import express from 'express';
import { login, register, refreshToken } from '../controller/auth.controller.js';

const router = express.Router();

// Route for user login
router.post('/login', login);

// Route for user registration
router.post('/register', register);

// Route for refreshing access token
router.post('/refresh-token', refreshToken);

export default router;
