import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import useAuthStore from './store/authStore';

// Lazy load pages
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Venues = React.lazy(() => import('./pages/Venues'));
const Groups = React.lazy(() => import('./pages/Groups'));
const Requests = React.lazy(() => import('./pages/Requests'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Users = React.lazy(() => import('./pages/Users'));

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }
      >
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
            <Route index element={<Dashboard />} />
            <Route path="venues" element={<Venues />} />
            <Route path="groups" element={<Groups />} />
            <Route path="requests" element={<Requests />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;