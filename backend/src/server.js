import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect_db } from './config/db.config.js';
import { initializeAdmin } from './controller/auth.controller.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import requestRoute from './routes/request.route.js';
import groupRoutes from './routes/group.route.js';
import venueRoutes from './routes/venue.route.js';
import settingsRoutes from './routes/settings.routes.js';
import profileRoutes from './routes/profileRoutes.js';
import { authenticateToken } from './middleware/jwt.middleware.js';

const app = express();
dotenv.config();
app.use(express.json());

// Configure CORS to allow frontend requests
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('Serving uploads from:', path.join(__dirname, '../uploads'));

const PORT = process.env.BACKEND_PORT || 5001;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-scheduler';

// Connect to database before starting server
try {
  await connect_db();
  console.log('Connected to the database');
  
  // Initialize admin account
  await initializeAdmin();
  
  // Connect to MongoDB
  await mongoose.connect(DB_URI);
  console.log('Connected to MongoDB successfully');
  
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
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/venue', authenticateToken, venueRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
