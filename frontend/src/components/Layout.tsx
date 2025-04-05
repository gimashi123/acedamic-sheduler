import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BookText, 
  User, 
  UserPlus, 
  Settings, 
  Calendar, 
  ClipboardList, 
  BookOpen, 
  MessageSquare, 
  Book,
  LogOut,
  Table
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import ChangePasswordModal from './ChangePasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProfilePicture } from '../features/profile/profileSlice';
import ProfilePicture from './ProfilePicture';
import { AppDispatch } from '../store/store';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Menu, MenuItem, Tooltip, Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);
  const dispatch = useDispatch<AppDispatch>();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  
  useEffect(() => {
    if (user) {
      dispatch(fetchProfilePicture());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
    setIsProfileMenuOpen(true);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
    setIsProfileMenuOpen(false);
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
            <Link to="/subjects" className="text-gray-700 hover:text-gray-900">
              <BookText className="h-5 w-5" />
            </Link>
            <Link to="/timetables" className="text-gray-700 hover:text-gray-900">
              <Table className="h-5 w-5" />
            </Link>
            <Link to="/subject-assignments" className="text-gray-700 hover:text-gray-900">
              <Book className="h-5 w-5" />
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
            <Link to="/subject-assignments" className="text-gray-700 hover:text-gray-900">
              <Book className="h-5 w-5" />
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
      <div className="flex items-center">
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={isProfileMenuOpen ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen ? 'true' : undefined}
          >
            <ProfilePicture
              profilePicture={profilePicture}
              size="small"
              editable={false}
            />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={profileAnchorEl}
          id="account-menu"
          open={isProfileMenuOpen}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => setIsChangePasswordModalOpen(true)}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Change Password
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
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