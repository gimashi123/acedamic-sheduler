import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, Building2, UserPlus, Settings, User, BookOpen, MessageSquare, ClipboardList } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ChangePasswordModal from './ChangePasswordModal';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItems = () => {
    if (!user) return null;

    switch (user.role) {
      case 'Admin':
        return (
          <>
            <Link to="/venues" className="text-gray-700 hover:text-gray-900">
              <Building2 className="h-5 w-5" />
            </Link>
            <Link to="/groups" className="text-gray-700 hover:text-gray-900">
              <Users className="h-5 w-5" />
            </Link>
            <Link to="/users" className="text-gray-700 hover:text-gray-900">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/requests" className="text-gray-700 hover:text-gray-900">
              <UserPlus className="h-5 w-5" />
            </Link>
            <Link to="/settings" className="text-gray-700 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Link>
          </>
        );
      case 'Lecturer':
        return (
          <>
            <Link to="/schedule" className="text-gray-700 hover:text-gray-900">
              <Calendar className="h-5 w-5" />
            </Link>
            <Link to="/classes" className="text-gray-700 hover:text-gray-900">
              <Users className="h-5 w-5" />
            </Link>
            <Link to="/attendance" className="text-gray-700 hover:text-gray-900">
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/materials" className="text-gray-700 hover:text-gray-900">
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link to="/messages" className="text-gray-700 hover:text-gray-900">
              <MessageSquare className="h-5 w-5" />
            </Link>
          </>
        );
      case 'Student':
        return (
          <>
            <Link to="/schedule" className="text-gray-700 hover:text-gray-900">
              <Calendar className="h-5 w-5" />
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-gray-900">
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link to="/attendance" className="text-gray-700 hover:text-gray-900">
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/messages" className="text-gray-700 hover:text-gray-900">
              <MessageSquare className="h-5 w-5" />
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-900">
                <Calendar className="h-6 w-6 mr-2" />
                <span className="font-semibold">Academic Scheduler</span>
              </Link>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                {renderNavItems()}
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Layout; 