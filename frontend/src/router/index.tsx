import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import NotFound from '../components/NotFound';
import Login from '../features/auth/Login';
import ChangePassword from '../features/auth/ChangePassword';
import DashboardRouter from '../components/dashboards/DashboardRouter';
import RegisterRequestForm from '../features/auth/RegisterRequestForm';
import ProfilePage from '../features/profile/ProfilePage';

// Import feature components 
import Venues from '../features/venues/Venues';
import Groups from '../features/groups/Groups'; 
import Requests from '../features/requests/Requests';
import Settings from '../features/settings/Settings';
import Users from '../features/users/Users';
import Subjects from '../features/subjects/Subjects';
import AdminSubjects from '../features/subjects/AdminSubjects';
import Analytics from '../features/analytics/Analytics';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardRouter />} />
            <Route path="venues" element={<Venues />} />
            <Route path="groups" element={<Groups />} />
            <Route path="requests" element={<Requests />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="admin/subjects" element={<AdminSubjects />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="register-request" element={<RegisterRequestForm />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter; 