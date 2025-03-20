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

### Adding a New Backend Feature

1. **Create a new model** (if needed):
   ```javascript
   // src/models/YourModel.js
   const mongoose = require('mongoose');

   const YourModelSchema = new mongoose.Schema({
     name: { type: String, required: true },
     // Add your fields
   }, { timestamps: true });

   module.exports = mongoose.model('YourModel', YourModelSchema);
   ```

2. **Create a controller**:
   ```javascript
   // src/controllers/yourController.js
   const YourModel = require('../models/YourModel');

   exports.getAllItems = async (req, res) => {
     try {
       const items = await YourModel.find({});
       res.status(200).json({ success: true, data: items });
     } catch (error) {
       res.status(500).json({ success: false, message: error.message });
     }
   };

   // Add more controller methods
   ```

3. **Create routes**:
   ```javascript
   // src/routes/yourRoutes.js
   const express = require('express');
   const { getAllItems } = require('../controllers/yourController');
   const { protect, authorize } = require('../middleware/auth');

   const router = express.Router();

   router.get('/', protect, authorize('Admin'), getAllItems);

   module.exports = router;
   ```

4. **Register the routes** in `server.js` or main routes file:
   ```javascript
   // Register in server.js or main routes file
   const yourRoutes = require('./routes/yourRoutes');
   app.use('/api/your-feature', yourRoutes);
   ```

### Adding a New Frontend Feature

1. **Create types** (if needed):
   ```typescript
   // src/types/yourType.ts
   export interface YourType {
     _id: string;
     name: string;
     // Add your properties
   }
   ```

2. **Create a service** to interact with the API:
   ```typescript
   // src/features/your-feature/yourService.ts
   import axios from 'axios';
   import { YourType } from '../../types/yourType';

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

   const getAuthHeader = () => {
     const token = localStorage.getItem('accessToken');
     return {
       headers: {
         Authorization: `Bearer ${token}`
       }
     };
   };

   export const yourService = {
     getAllItems: async (): Promise<YourType[]> => {
       try {
         const response = await axios.get(`${API_URL}/your-feature`, getAuthHeader());
         return response.data.data || [];
       } catch (error) {
         console.error('Error fetching items:', error);
         return [];
       }
     },
     
     // Add more service methods
   };
   ```

3. **Create a React component**:
   ```typescript
   // src/features/your-feature/YourFeature.tsx
   import React, { useState, useEffect } from 'react';
   import { YourType } from '../../types/yourType';
   import { yourService } from './yourService';

   const YourFeature: React.FC = () => {
     const [items, setItems] = useState<YourType[]>([]);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
       const fetchItems = async () => {
         setIsLoading(true);
         try {
           const data = await yourService.getAllItems();
           setItems(data);
         } catch (error) {
           console.error(error);
         } finally {
           setIsLoading(false);
         }
       };

       fetchItems();
     }, []);

     // Component JSX
     return (
       <div>
         <h1>Your Feature</h1>
         {isLoading ? (
           <div>Loading...</div>
         ) : (
           <div>
             {items.map(item => (
               <div key={item._id}>{item.name}</div>
             ))}
           </div>
         )}
       </div>
     );
   };

   export default YourFeature;
   ```

4. **Add to the router**:
   ```typescript
   // src/router/index.tsx
   import YourFeature from '../features/your-feature/YourFeature';

   // Inside the Routes component
   <Route path="/your-feature" element={<YourFeature />} />
   ```

5. **Link from the appropriate dashboard**:
   ```typescript
   // In the appropriate dashboard component
   <Link to="/your-feature" className="...">
     <Icon className="..." />
     <h3>Your Feature</h3>
     <p>Description of your feature</p>
   </Link>
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register-request` - Request registration
- `POST /api/auth/change-password` - Change password

### Request Endpoints

- `GET /api/request/all` - Get all requests (Admin only)
- `GET /api/request/status/:status` - Get requests by status
- `POST /api/request/approve/:id` - Approve request
- `POST /api/request/reject/:id` - Reject request

### User Endpoints

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Venue Endpoints

- `GET /api/venues` - Get all venues
- `POST /api/venues` - Create venue (Admin only)
- `PUT /api/venues/:id` - Update venue (Admin only)
- `DELETE /api/venues/:id` - Delete venue (Admin only)

### Group Endpoints

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group (Admin only)
- `PUT /api/groups/:id` - Update group (Admin only)
- `DELETE /api/groups/:id` - Delete group (Admin only)

## Authentication & Authorization

The system uses JWT for authentication and role-based authorization:

1. Users register via the registration request form
2. Admin approves registration requests
3. Users login with email and password
4. System issues JWT tokens (access and refresh)
5. Protected routes require valid tokens
6. Role-based middleware restricts access based on user roles

### Token Management

- Access tokens expire after 24 hours
- Refresh tokens are used to get new access tokens
- Tokens are stored in localStorage on the frontend
- Token validation happens on every protected API request

## Contributing Guidelines

1. **Fork the repository**
2. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Follow code style guide**:
   - Use meaningful names for variables and functions
   - Add appropriate comments for complex logic
   - Keep functions small and focused
   - Follow the existing project structure

4. **Test your changes** thoroughly
5. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a pull request** to the main repository

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).

## Technical Walkthroughs

### Backend Endpoint Implementation Sequence

Here's a detailed step-by-step guide to add a new endpoint to the backend:

1. **Define Database Schema**
   ```javascript
   // 1. Create a new model file in src/models/Subject.js
   const mongoose = require('mongoose');

   const SubjectSchema = new mongoose.Schema({
     name: { 
       type: String, 
       required: [true, 'Subject name is required'],
       trim: true,
       maxlength: [100, 'Subject name cannot exceed 100 characters']
     },
     code: {
       type: String,
       required: [true, 'Subject code is required'],
       unique: true,
       trim: true
     },
     department: {
       type: String,
       required: [true, 'Department is required']
     },
     credits: {
       type: Number,
       required: [true, 'Credits are required']
     },
     description: {
       type: String,
       maxlength: [500, 'Description cannot exceed 500 characters']
     },
     // References to other models
     instructor: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: [true, 'Instructor is required']
     }
   }, { timestamps: true });

   module.exports = mongoose.model('Subject', SubjectSchema);
   ```

2. **Create Controller Logic**
   ```javascript
   // 2. Create a controller file in src/controllers/subjectController.js
   const Subject = require('../models/Subject');
   const ErrorResponse = require('../utils/errorResponse');
   const asyncHandler = require('../middleware/async');

   // @desc    Get all subjects
   // @route   GET /api/subjects
   // @access  Public
   exports.getSubjects = asyncHandler(async (req, res, next) => {
     // Add query parameters for filtering if needed
     const subjects = await Subject.find().populate('instructor', 'firstName lastName email');
     
     res.status(200).json({
       success: true,
       count: subjects.length,
       data: subjects
     });
   });

   // @desc    Get single subject
   // @route   GET /api/subjects/:id
   // @access  Public
   exports.getSubject = asyncHandler(async (req, res, next) => {
     const subject = await Subject.findById(req.params.id).populate('instructor', 'firstName lastName email');
     
     if (!subject) {
       return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
     }
     
     res.status(200).json({
       success: true,
       data: subject
     });
   });

   // @desc    Create new subject
   // @route   POST /api/subjects
   // @access  Private (Admin & Lecturer)
   exports.createSubject = asyncHandler(async (req, res, next) => {
     // Add instructor ID from authenticated user if not provided
     if (!req.body.instructor) {
       req.body.instructor = req.user.id;
     }
     
     const subject = await Subject.create(req.body);
     
     res.status(201).json({
       success: true,
       data: subject
     });
   });

   // @desc    Update subject
   // @route   PUT /api/subjects/:id
   // @access  Private (Admin & Lecturer who owns the subject)
   exports.updateSubject = asyncHandler(async (req, res, next) => {
     let subject = await Subject.findById(req.params.id);
     
     if (!subject) {
       return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
     }
     
     // Make sure user is subject instructor or admin
     if (subject.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
       return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this subject`, 401));
     }
     
     subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
       new: true,
       runValidators: true
     });
     
     res.status(200).json({
       success: true,
       data: subject
     });
   });

   // @desc    Delete subject
   // @route   DELETE /api/subjects/:id
   // @access  Private (Admin only)
   exports.deleteSubject = asyncHandler(async (req, res, next) => {
     const subject = await Subject.findById(req.params.id);
     
     if (!subject) {
       return next(new ErrorResponse(`Subject not found with id of ${req.params.id}`, 404));
     }
     
     // Only admin can delete subjects
     if (req.user.role !== 'Admin') {
       return next(new ErrorResponse('Only administrators can delete subjects', 401));
     }
     
     await subject.remove();
     
     res.status(200).json({
       success: true,
       data: {}
     });
   });
   ```

3. **Create API Routes**
   ```javascript
   // 3. Create a routes file in src/routes/subjectRoutes.js
   const express = require('express');
   const {
     getSubjects,
     getSubject,
     createSubject,
     updateSubject,
     deleteSubject
   } = require('../controllers/subjectController');

   // Middleware
   const { protect, authorize } = require('../middleware/auth');

   const router = express.Router();

   router
     .route('/')
     .get(getSubjects)
     .post(protect, authorize('Admin', 'Lecturer'), createSubject);

   router
     .route('/:id')
     .get(getSubject)
     .put(protect, authorize('Admin', 'Lecturer'), updateSubject)
     .delete(protect, authorize('Admin'), deleteSubject);

   module.exports = router;
   ```

4. **Register Routes in Main App**
   ```javascript
   // 4. Register routes in server.js or app.js
   const subjectRoutes = require('./routes/subjectRoutes');

   // Mount routers
   app.use('/api/subjects', subjectRoutes);
   ```

5. **Create Error Handlers (if not already present)**
   ```javascript
   // 5. Create error response utility in src/utils/errorResponse.js
   class ErrorResponse extends Error {
     constructor(message, statusCode) {
       super(message);
       this.statusCode = statusCode;
     }
   }

   module.exports = ErrorResponse;
   ```

6. **Create Middleware (if not already present)**
   ```javascript
   // 6. Create async handler middleware in src/middleware/async.js
   const asyncHandler = (fn) => (req, res, next) =>
     Promise.resolve(fn(req, res, next)).catch(next);

   module.exports = asyncHandler;
   ```

7. **Test the API Endpoints**
   ```bash
   # Test with tools like Postman or curl
   # GET all subjects
   curl http://localhost:5000/api/subjects

   # POST a new subject (requires auth token)
   curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"Database Systems","code":"CS301","department":"Computer Science","credits":3,"description":"Introduction to database concepts"}' \
     http://localhost:5000/api/subjects
   ```

### Frontend Implementation Sequence

Here's how to implement the frontend components to consume the new backend endpoints:

1. **Define TypeScript Interface**
   ```typescript
   // 1. Create or update src/types/subject.ts 
   export interface Subject {
     _id: string;
     name: string;
     code: string;
     department: string;
     credits: number;
     description?: string;
     instructor: {
       _id: string;
       firstName: string;
       lastName: string;
       email: string;
     };
     createdAt: string;
     updatedAt: string;
   }

   export interface SubjectResponse {
     success: boolean;
     count?: number;
     data: Subject | Subject[];
   }
   ```

2. **Create API Service**
   ```typescript
   // 2. Create src/features/subjects/subjectService.ts
   import axios from 'axios';
   import { Subject, SubjectResponse } from '../../types/subject';

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

   const getAuthHeader = () => {
     const token = localStorage.getItem('accessToken');
     return {
       headers: {
         Authorization: `Bearer ${token}`
       }
     };
   };

   export const subjectService = {
     // Get all subjects
     getAllSubjects: async (): Promise<Subject[]> => {
       try {
         const response = await axios.get<SubjectResponse>(`${API_URL}/subjects`);
         // The API returns data in an array format for multiple items
         return Array.isArray(response.data.data) ? response.data.data : [];
       } catch (error) {
         console.error('Error fetching subjects:', error);
         return [];
       }
     },

     // Get subject by ID
     getSubjectById: async (id: string): Promise<Subject | null> => {
       try {
         const response = await axios.get<SubjectResponse>(`${API_URL}/subjects/${id}`);
         // The API returns a single object for one item
         return !Array.isArray(response.data.data) ? response.data.data : null;
       } catch (error) {
         console.error(`Error fetching subject ${id}:`, error);
         return null;
       }
     },

     // Create new subject
     createSubject: async (subjectData: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>): Promise<Subject | null> => {
       try {
         const response = await axios.post<SubjectResponse>(
           `${API_URL}/subjects`, 
           subjectData, 
           getAuthHeader()
         );
         return !Array.isArray(response.data.data) ? response.data.data : null;
       } catch (error) {
         console.error('Error creating subject:', error);
         throw error;
       }
     },

     // Update subject
     updateSubject: async (id: string, subjectData: Partial<Subject>): Promise<Subject | null> => {
       try {
         const response = await axios.put<SubjectResponse>(
           `${API_URL}/subjects/${id}`, 
           subjectData, 
           getAuthHeader()
         );
         return !Array.isArray(response.data.data) ? response.data.data : null;
       } catch (error) {
         console.error(`Error updating subject ${id}:`, error);
         throw error;
       }
     },

     // Delete subject
     deleteSubject: async (id: string): Promise<boolean> => {
       try {
         await axios.delete(`${API_URL}/subjects/${id}`, getAuthHeader());
         return true;
       } catch (error) {
         console.error(`Error deleting subject ${id}:`, error);
         throw error;
       }
     }
   };
   ```

3. **Create Custom Hook for Data Management**
   ```typescript
   // 3. Create src/features/subjects/useSubjects.ts
   import { useState, useEffect, useCallback } from 'react';
   import { Subject } from '../../types/subject';
   import { subjectService } from './subjectService';
   import { toast } from 'react-hot-toast';

   export const useSubjects = () => {
     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

     // Fetch all subjects
     const fetchSubjects = useCallback(async () => {
       setIsLoading(true);
       setError(null);
       try {
         const data = await subjectService.getAllSubjects();
         setSubjects(data);
       } catch (err) {
         setError('Failed to fetch subjects');
         toast.error('Failed to load subjects');
       } finally {
         setIsLoading(false);
       }
     }, []);

     // Get subject by ID
     const getSubject = useCallback(async (id: string) => {
       setIsLoading(true);
       setError(null);
       try {
         const subject = await subjectService.getSubjectById(id);
         setCurrentSubject(subject);
         return subject;
       } catch (err) {
         setError('Failed to fetch subject details');
         toast.error('Failed to load subject details');
         return null;
       } finally {
         setIsLoading(false);
       }
     }, []);

     // Create new subject
     const createSubject = useCallback(async (subjectData: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>) => {
       setIsLoading(true);
       setError(null);
       try {
         const newSubject = await subjectService.createSubject(subjectData);
         if (newSubject) {
           setSubjects(prev => [...prev, newSubject]);
           toast.success('Subject created successfully');
         }
         return newSubject;
       } catch (err) {
         setError('Failed to create subject');
         toast.error('Failed to create subject');
         return null;
       } finally {
         setIsLoading(false);
       }
     }, []);

     // Update subject
     const updateSubject = useCallback(async (id: string, subjectData: Partial<Subject>) => {
       setIsLoading(true);
       setError(null);
       try {
         const updatedSubject = await subjectService.updateSubject(id, subjectData);
         if (updatedSubject) {
           setSubjects(prev => prev.map(subject => 
             subject._id === id ? updatedSubject : subject
           ));
           setCurrentSubject(updatedSubject);
           toast.success('Subject updated successfully');
         }
         return updatedSubject;
       } catch (err) {
         setError('Failed to update subject');
         toast.error('Failed to update subject');
         return null;
       } finally {
         setIsLoading(false);
       }
     }, []);

     // Delete subject
     const deleteSubject = useCallback(async (id: string) => {
       setIsLoading(true);
       setError(null);
       try {
         const success = await subjectService.deleteSubject(id);
         if (success) {
           setSubjects(prev => prev.filter(subject => subject._id !== id));
           setCurrentSubject(null);
           toast.success('Subject deleted successfully');
         }
         return success;
       } catch (err) {
         setError('Failed to delete subject');
         toast.error('Failed to delete subject');
         return false;
       } finally {
         setIsLoading(false);
       }
     }, []);

     // Load subjects on component mount
     useEffect(() => {
       fetchSubjects();
     }, [fetchSubjects]);

     return {
       subjects,
       currentSubject,
       isLoading,
       error,
       fetchSubjects,
       getSubject,
       createSubject,
       updateSubject,
       deleteSubject
     };
   };
   ```

4. **Create List Component**
   ```tsx
   // 4. Create src/features/subjects/SubjectsList.tsx
   import React from 'react';
   import { useSubjects } from './useSubjects';
   import { Link } from 'react-router-dom';
   import { 
     Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
     Paper, Button, Typography, Box, CircularProgress
   } from '@mui/material';
   import { Edit, Delete, Add } from '@mui/icons-material';
   import useAuthStore from '../../store/authStore';

   const SubjectsList: React.FC = () => {
     const { subjects, isLoading, error, deleteSubject } = useSubjects();
     const { user } = useAuthStore();
     const isAdmin = user?.role === 'Admin';

     if (isLoading) {
       return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
           <CircularProgress />
         </Box>
       );
     }

     if (error) {
       return (
         <Box p={3} textAlign="center">
           <Typography color="error">{error}</Typography>
         </Box>
       );
     }

     if (!subjects.length) {
       return (
         <Box p={3} display="flex" flexDirection="column" alignItems="center">
           <Typography variant="h6" color="textSecondary" gutterBottom>
             No subjects found
           </Typography>
           {(isAdmin || user?.role === 'Lecturer') && (
             <Button 
               variant="contained" 
               color="primary" 
               startIcon={<Add />}
               component={Link}
               to="/subjects/new"
             >
               Add Subject
             </Button>
           )}
         </Box>
       );
     }

     return (
       <div className="p-4">
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
           <Typography variant="h4">Subjects</Typography>
           {(isAdmin || user?.role === 'Lecturer') && (
             <Button 
               variant="contained" 
               color="primary" 
               startIcon={<Add />}
               component={Link}
               to="/subjects/new"
             >
               Add Subject
             </Button>
           )}
         </Box>
         
         <TableContainer component={Paper}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell>Code</TableCell>
                 <TableCell>Name</TableCell>
                 <TableCell>Department</TableCell>
                 <TableCell>Credits</TableCell>
                 <TableCell>Instructor</TableCell>
                 <TableCell>Actions</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {subjects.map((subject) => (
                 <TableRow key={subject._id}>
                   <TableCell>{subject.code}</TableCell>
                   <TableCell>
                     <Link to={`/subjects/${subject._id}`} className="text-blue-600 hover:underline">
                       {subject.name}
                     </Link>
                   </TableCell>
                   <TableCell>{subject.department}</TableCell>
                   <TableCell>{subject.credits}</TableCell>
                   <TableCell>{`${subject.instructor.firstName} ${subject.instructor.lastName}`}</TableCell>
                   <TableCell>
                     <div className="flex gap-2">
                       {(isAdmin || subject.instructor._id === user?._id) && (
                         <>
                           <Button
                             size="small"
                             variant="outlined"
                             color="primary"
                             startIcon={<Edit />}
                             component={Link}
                             to={`/subjects/${subject._id}/edit`}
                           >
                             Edit
                           </Button>
                           {isAdmin && (
                             <Button
                               size="small"
                               variant="outlined"
                               color="error"
                               startIcon={<Delete />}
                               onClick={() => {
                                 if (window.confirm('Are you sure you want to delete this subject?')) {
                                   deleteSubject(subject._id);
                                 }
                               }}
                             >
                               Delete
                             </Button>
                           )}
                         </>
                       )}
                     </div>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
       </div>
     );
   };

   export default SubjectsList;
   ```

5. **Create Form Component**
   ```tsx
   // 5. Create src/features/subjects/SubjectForm.tsx
   import React, { useState, useEffect } from 'react';
   import { useParams, useNavigate } from 'react-router-dom';
   import { useSubjects } from './useSubjects';
   import { 
     TextField, Button, Grid, Typography, Box, 
     CircularProgress, Paper, FormControl, 
     InputLabel, Select, MenuItem, FormHelperText
   } from '@mui/material';
   import { Save } from '@mui/icons-material';
   import useAuthStore from '../../store/authStore';
   import { Subject } from '../../types/subject';

   const SubjectForm: React.FC = () => {
     const { id } = useParams<{ id: string }>();
     const navigate = useNavigate();
     const isEditMode = Boolean(id);
     const { getSubject, createSubject, updateSubject, isLoading } = useSubjects();
     const { user } = useAuthStore();
     
     const [formData, setFormData] = useState({
       name: '',
       code: '',
       department: '',
       credits: 3,
       description: ''
     });
     
     const [errors, setErrors] = useState({
       name: '',
       code: '',
       department: '',
       credits: ''
     });

     useEffect(() => {
       if (isEditMode && id) {
         const fetchSubject = async () => {
           const subject = await getSubject(id);
           if (subject) {
             setFormData({
               name: subject.name,
               code: subject.code,
               department: subject.department,
               credits: subject.credits,
               description: subject.description || ''
             });
           }
         };
         
         fetchSubject();
       }
     }, [isEditMode, id, getSubject]);

     const validateForm = () => {
       let valid = true;
       const newErrors = {
         name: '',
         code: '',
         department: '',
         credits: ''
       };
       
       if (!formData.name.trim()) {
         newErrors.name = 'Subject name is required';
         valid = false;
       }
       
       if (!formData.code.trim()) {
         newErrors.code = 'Subject code is required';
         valid = false;
       }
       
       if (!formData.department.trim()) {
         newErrors.department = 'Department is required';
         valid = false;
       }
       
       if (formData.credits <= 0) {
         newErrors.credits = 'Credits must be greater than 0';
         valid = false;
       }
       
       setErrors(newErrors);
       return valid;
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
       const { name, value } = e.target;
       setFormData(prev => ({
         ...prev,
         [name as string]: value
       }));
     };

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       
       if (!validateForm()) return;
       
       try {
         if (isEditMode && id) {
           await updateSubject(id, formData);
         } else {
           await createSubject({
             ...formData,
             instructor: user?._id as string
           } as Omit<Subject, '_id' | 'createdAt' | 'updatedAt'>);
         }
         
         navigate('/subjects');
       } catch (error) {
         console.error('Form submission error:', error);
       }
     };

     return (
       <Paper className="p-6 max-w-3xl mx-auto mt-8">
         <Typography variant="h5" gutterBottom>
           {isEditMode ? 'Edit Subject' : 'Add New Subject'}
         </Typography>
         
         <form onSubmit={handleSubmit}>
           <Grid container spacing={3}>
             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Subject Name"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 error={!!errors.name}
                 helperText={errors.name}
                 required
               />
             </Grid>
             
             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Subject Code"
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 error={!!errors.code}
                 helperText={errors.code}
                 required
                 disabled={isEditMode} // Typically codes shouldn't change
               />
             </Grid>
             
             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Department"
                 name="department"
                 value={formData.department}
                 onChange={handleChange}
                 error={!!errors.department}
                 helperText={errors.department}
                 required
               />
             </Grid>
             
             <Grid item xs={12} sm={6}>
               <TextField
                 fullWidth
                 label="Credits"
                 name="credits"
                 type="number"
                 value={formData.credits}
                 onChange={handleChange}
                 error={!!errors.credits}
                 helperText={errors.credits}
                 InputProps={{ inputProps: { min: 1, max: 6 } }}
                 required
               />
             </Grid>
             
             <Grid item xs={12}>
               <TextField
                 fullWidth
                 label="Description"
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 multiline
                 rows={4}
               />
             </Grid>
             
             <Grid item xs={12} className="flex justify-end space-x-2">
               <Button 
                 variant="outlined" 
                 onClick={() => navigate('/subjects')}
               >
                 Cancel
               </Button>
               <Button
                 type="submit"
                 variant="contained"
                 color="primary"
                 startIcon={<Save />}
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <CircularProgress size={24} />
                 ) : (
                   isEditMode ? 'Update Subject' : 'Save Subject'
                 )}
               </Button>
             </Grid>
           </Grid>
         </form>
       </Paper>
     );
   };

   export default SubjectForm;
   ```

6. **Create Detail Component**
   ```tsx
   // 6. Create src/features/subjects/SubjectDetail.tsx
   import React, { useEffect } from 'react';
   import { useParams, useNavigate, Link } from 'react-router-dom';
   import { useSubjects } from './useSubjects';
   import { 
     Typography, Box, Paper, Grid, Divider, Button, 
     Chip, CircularProgress, Alert
   } from '@mui/material';
   import { Edit, Delete, ArrowBack } from '@mui/icons-material';
   import useAuthStore from '../../store/authStore';

   const SubjectDetail: React.FC = () => {
     const { id } = useParams<{ id: string }>();
     const navigate = useNavigate();
     const { getSubject, currentSubject, isLoading, error, deleteSubject } = useSubjects();
     const { user } = useAuthStore();
     const isAdmin = user?.role === 'Admin';
     const isOwner = currentSubject?.instructor._id === user?._id;
     const canEdit = isAdmin || isOwner;

     useEffect(() => {
       if (id) {
         getSubject(id);
       }
     }, [id, getSubject]);

     const handleDelete = async () => {
       if (!id || !window.confirm('Are you sure you want to delete this subject?')) return;
       
       const success = await deleteSubject(id);
       if (success) {
         navigate('/subjects');
       }
     };

     if (isLoading) {
       return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
           <CircularProgress />
         </Box>
       );
     }

     if (error) {
       return (
         <Box p={3}>
           <Alert severity="error">{error}</Alert>
         </Box>
       );
     }

     if (!currentSubject) {
       return (
         <Box p={3}>
           <Alert severity="warning">Subject not found</Alert>
           <Button 
             variant="outlined" 
             component={Link} 
             to="/subjects"
             startIcon={<ArrowBack />}
             sx={{ mt: 2 }}
           >
             Back to Subjects
           </Button>
         </Box>
       );
     }

     return (
       <Paper className="p-6 max-w-4xl mx-auto mt-8">
         <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start">
           <div>
             <Typography variant="h4" gutterBottom>
               {currentSubject.name}
             </Typography>
             <Chip label={currentSubject.code} color="primary" sx={{ mr: 1 }} />
             <Chip label={`${currentSubject.credits} Credits`} color="secondary" />
           </div>
           
           <div className="space-x-2">
             <Button 
               variant="outlined" 
               component={Link} 
               to="/subjects"
               startIcon={<ArrowBack />}
             >
               Back
             </Button>
             
             {canEdit && (
               <Button
                 variant="outlined"
                 color="primary"
                 startIcon={<Edit />}
                 component={Link}
                 to={`/subjects/${id}/edit`}
               >
                 Edit
               </Button>
             )}
             
             {isAdmin && (
               <Button
                 variant="outlined"
                 color="error"
                 startIcon={<Delete />}
                 onClick={handleDelete}
               >
                 Delete
               </Button>
             )}
           </div>
         </Box>
         
         <Divider sx={{ mb: 3 }} />
         
         <Grid container spacing={3}>
           <Grid item xs={12} sm={6}>
             <Typography variant="subtitle1" color="textSecondary">Department</Typography>
             <Typography variant="body1">{currentSubject.department}</Typography>
           </Grid>
           
           <Grid item xs={12} sm={6}>
             <Typography variant="subtitle1" color="textSecondary">Instructor</Typography>
             <Typography variant="body1">
               {`${currentSubject.instructor.firstName} ${currentSubject.instructor.lastName}`}
             </Typography>
             <Typography variant="body2" color="textSecondary">
               {currentSubject.instructor.email}
             </Typography>
           </Grid>
           
           <Grid item xs={12}>
             <Typography variant="subtitle1" color="textSecondary">Description</Typography>
             <Typography variant="body1">
               {currentSubject.description || 'No description provided.'}
             </Typography>
           </Grid>
         </Grid>
       </Paper>
     );
   };

   export default SubjectDetail;
   ```

7. **Update Router**
   ```tsx
   // 7. Update src/router/index.tsx to include the new routes
   import SubjectsList from '../features/subjects/SubjectsList';
   import SubjectDetail from '../features/subjects/SubjectDetail';
   import SubjectForm from '../features/subjects/SubjectForm';

   // Inside the Routes component
   <Route path="subjects" element={<SubjectsList />} />
   <Route path="subjects/:id" element={<SubjectDetail />} />
   <Route path="subjects/new" element={<SubjectForm />} />
   <Route path="subjects/:id/edit" element={<SubjectForm />} />
   ```

8. **Add Dashboard Link**
   ```tsx
   // 8. Add to the appropriate dashboard component
   // For example, in AdminDashboard.tsx
   <Link to="/subjects" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition-colors">
     <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
     <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
     <p className="text-gray-600">Manage courses and subjects</p>
   </Link>
   ```

### Key Technical Considerations

1. **Error Handling**
   - Always wrap database operations in try/catch blocks
   - Return appropriate HTTP status codes
   - Provide meaningful error messages to clients
   - Use custom error handling middleware in the backend

2. **Authentication & Authorization**
   - Use token-based authentication for API requests
   - Implement role-based access control for protected routes
   - Separate public and private endpoints
   - Validate user permissions for CRUD operations

3. **Data Validation**
   - Validate inputs on both client and server side
   - Use Mongoose schema validation for backend
   - Implement form validation in the frontend
   - Sanitize inputs to prevent security issues

4. **Performance Considerations**
   - Implement pagination for listing routes
   - Use indexing for database collections
   - Consider caching for frequently accessed data
   - Optimize frontend rendering for large datasets

5. **Code Organization**
   - Follow the established project structure
   - Maintain separation of concerns
   - Keep components focused and reusable
   - Use consistent naming conventions

6. **Testing**
   - Test API endpoints with Postman or similar tools
   - Verify proper authentication checks
   - Test error handling scenarios
   - Validate data integrity

By following these detailed steps and best practices, you can efficiently add new features to the Academic Scheduler system while maintaining code quality and consistency. 