import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import StudentDashboard from './StudentDashboard';
import LecturerDashboard from './LecturerDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Lecturer':
      return <LecturerDashboard />;
    case 'Student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter; 