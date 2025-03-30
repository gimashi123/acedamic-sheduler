const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const routes = require('./routes/index');

// Use API routes
app.use('/api', routes);

// Make sure the uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = app; 