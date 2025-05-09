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
import subjectRoutes from './routes/subject.route.js';
import { authenticateToken } from './middleware/jwt.middleware.js';
import studentRoutes from './routes/student.route.js';
import timeTableRoutes from './routes/timetable.route.js';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import profileRoutes from './routes/profileRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config();
app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const PORT = process.env.BACKEND_PORT || 5001;

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('Serving uploads from:', path.join(__dirname, '../uploads'));

// Connect to a database before starting a server
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

app.get('/hello', (_, res) => {
  res.send('Backend is up and running');
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/timetable', timeTableRoutes);
// API routes
app.use('/api/request', requestRoute);
app.use('/api/group',  groupRoutes); // add authenticateToken after the testing
app.use('/api/venue', authenticateToken, venueRoutes); // add authenticateToken after the testing
app.use('/api/settings', settingsRoutes);
// Add Subject API route
app.use('/api/subject', authenticateToken, subjectRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
// Add StudentAdd API route
app.use('/api/student', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close the server & exit process
  process.exit(1);
});
