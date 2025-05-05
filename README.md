# Academic Scheduler System

A comprehensive academic scheduling system with role-based access control for managing university/college schedules, venues, and users.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Adding New Features](#adding-new-features)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Contributing Guidelines](#contributing-guidelines)

## Overview

The Academic Scheduler system is designed to manage academic schedules, venues, and user roles for educational institutions. The system supports three main user roles: Admin, Lecturer, and Student, each with specific permissions and capabilities.

## Features

### Core Features

- **User Management**: Registration, authentication, and role-based access control
- **Registration Request System**: Admin approval workflow for new user registrations
- **Venue Management**: Create, manage, and schedule academic venues
- **Group Management**: Organize students into groups based on faculty, department, etc.
- **Schedule Management**: Create and manage academic schedules
- **Role-Based Dashboards**: Tailored experiences for Admins, Lecturers, and Students

### Role-Specific Features

#### Admin
- Approve/reject user registration requests
- Manage all users, venues, groups, and schedules
- Access system analytics and reports
- Configure system settings

#### Lecturer
- View teaching schedule
- Manage classes and teaching materials
- Track student attendance
- Communicate with students

#### Student
- View class schedule
- Access course materials
- Track attendance
- Receive notifications

## Project Structure

### Backend

The backend is built with Node.js, Express, and MongoDB, following an MVC architecture:

```
/backend
├── /src
│   ├── /controllers     # Request handlers
│   ├── /models          # Database schemas
│   ├── /routes          # API endpoints
│   ├── /middleware      # Auth and validation middleware
│   ├── /services        # Business logic
│   ├── /utils           # Helper functions
│   └── /config          # Configuration files
├── server.js            # Entry point
└── package.json         # Dependencies
```

### Frontend

The frontend is built with React, TypeScript, and Material-UI:

```
/frontend
├── /src
│   ├── /assets          # Static assets
│   ├── /components      # Reusable UI components
│   ├── /features        # Feature modules
│   │   ├── /auth        # Authentication-related components
│   │   ├── /requests    # Request management
│   │   ├── /venues      # Venue management
│   │   ├── /groups      # Group management
│   │   ├── /users       # User management
│   │   └── /settings    # Settings management
│   ├── /router          # Application routing
│   ├── /store           # State management
│   ├── /types           # TypeScript definitions
│   └── /utils           # Helper functions
├── App.tsx              # Main component
└── package.json         # Dependencies
```

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt for password hashing

### Frontend
- React & React Router
- TypeScript
- Material-UI & Tailwind CSS
- Zustand for state management
- Axios for API communication

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/academic-scheduler.git
   cd academic-scheduler
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   - Create `.env` file in the backend directory:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/academic-scheduler
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRE=24h
     ```
   - Create `.env` file in the frontend directory:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```

5. Start the development servers:
   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

6. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

## Adding New Features

========backend---
MONGODB_URI=mongodb+srv://yasithabhanukac:bhanuka1234567890@cluster0.2jkeysg.mongodb.net/testing?retryWrites=true&w=majority&appName=Cluster0
BACKEND_PORT=5000
JWT_SECRET=academic-scheduler-secret-key
EMAIL_ENABLED=true
EMAIL_SERVICE_EMAIL=academicschedular@gmail.com
EMAIL_SERVICE_PASSWORD=cugdkggkljsdcaai
ADMIN_EMAIL=admin@academicscheduler.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000

========frontend---
VITE_API_URL=http://localhost:5000/api