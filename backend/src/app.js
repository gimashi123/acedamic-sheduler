const express = require('express');
const path = require('path');
// ... other imports

const app = express();

// ... your other middleware setup

// Set up static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const profileRoutes = require('./routes/profileRoutes');
// ... other route imports

// Use routes
app.use('/api/users', profileRoutes);
// ... other route uses

// Make sure the uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
} 