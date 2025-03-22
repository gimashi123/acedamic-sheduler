import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, Building2, UserPlus, Settings, User, BookOpen, MessageSquare, ClipboardList } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ChangePasswordModal from './ChangePasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setProfilePicture } from '../features/profile/profileSlice';
import { profileService } from '../features/profile/profileService';
import ProfilePicture from './ProfilePicture';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    }
  }, [user]);

  const fetchProfilePicture = async () => {
    try {
      const result = await profileService.getProfilePicture();
      dispatch(setProfilePicture(result));
    } catch (error) {
      console.error('Failed to fetch profile picture:', error);
    }
  };

  const handleProfileUpdate = (newProfilePicture: any) => {
    dispatch(setProfilePicture(newProfilePicture));
  };

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

  const renderProfileSection = () => {
    if (!user) return null;

    return (
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <div className="relative">
          <ProfilePicture 
            profilePicture={profilePicture}
            size="small"
            editable={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-indigo-600">Academic Scheduler</Link>
        </div>
        
        {user && (
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              {renderNavItems()}
            </nav>
            
            <div className="flex items-center space-x-4">
              {renderProfileSection()}
              
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="text-gray-700 hover:text-gray-900 text-xs p-2 hover:bg-gray-100 rounded"
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
          </div>
        )}
      </header>
      
      <main className="flex-grow p-6">
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