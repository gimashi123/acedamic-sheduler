import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect_db } from './config/db.config.js';
import { initializeAdmin } from './controller/auth.controller.js';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import requestRoute from './routes/request.route.js';
import groupRoutes from './routes/group.route.js';
import venueRoutes from './routes/venue.route.js';
import settingsRoutes from './routes/settings.routes.js';
import { authenticateToken } from './middleware/jwt.middleware.js';

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const PORT = process.env.BACKEND_PORT || 5001;

// Connect to database before starting server
try {
  await connect_db();
  console.log('Connected to the database');
  
  // Initialize admin account
  await initializeAdmin();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/hello', (_, res) => {
  res.send('Backend is up and running');
});

// API routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/request', requestRoute);
app.use('/api/group', authenticateToken, groupRoutes);
app.use('/api/venue', authenticateToken, venueRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
