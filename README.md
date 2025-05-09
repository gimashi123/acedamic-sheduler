# Academic Scheduler

A comprehensive academic scheduling system built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Role-based authentication (Admin, Lecturer, Student)
- JWT-based authentication with refresh tokens
- Responsive UI built with Material-UI
- Dashboard for each role with specific features

## Project Structure

The project is divided into two main parts:

### Backend (Node.js + Express + MongoDB)

- RESTful API for authentication and data management
- JWT-based authentication with refresh tokens
- Role-based access control
- MongoDB database for data storage

### Frontend (React + TypeScript + Material-UI)

- Modern UI built with Material-UI
- TypeScript for type safety
- React Router for navigation
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/academic-scheduler.git
cd academic-scheduler
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
   - Create a `.env` file in the backend directory with the following variables:
   ```
   BACKEND_PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE_EMAIL=your_email@gmail.com
   EMAIL_SERVICE_PASSWORD=your_email_password
   ```

5. Start the backend server
```bash
cd backend
npm run dev
```

6. Start the frontend development server
```bash
cd frontend
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh-token` - Refresh access token

### User Management

- `GET /api/user` - Get all users (Admin only)
- `POST /api/user/register-admin` - Register a new admin (Admin only)
- `POST /api/user/register-user/:requestId` - Register a user from a request (Admin only)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
