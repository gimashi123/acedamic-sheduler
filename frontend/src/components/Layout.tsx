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
  Moon,
  Sun
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import ChangePasswordModal from './ChangePasswordModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProfilePicture } from '../features/profile/profileSlice';
import ProfilePicture from './ProfilePicture';
import { AppDispatch } from '../store/store';
import { toggleTheme } from '../store/themeSlice';
import { useTheme } from '../contexts/ThemeContext';
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
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);
  const { mode, toggleMode, isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  
  useEffect(() => {
    if (user) {
      dispatch(fetchProfilePicture());
    }
  }, [user, dispatch]);

  const handleThemeToggle = () => {
    toggleMode();
  };

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

    const linkClass = "transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-400";

    switch (user.role) {
      case 'Admin':
        return (
          <>
            <Link to="/venues" className={linkClass}>
              <Building2 className="h-5 w-5" />
            </Link>
            <Link to="/groups" className={linkClass}>
              <Users className="h-5 w-5" />
            </Link>
            <Link to="/subjects" className={linkClass}>
              <BookText className="h-5 w-5" />
            </Link>
            <Link to="/subject-assignments" className={linkClass}>
              <Book className="h-5 w-5" />
            </Link>
            <Link to="/users" className={linkClass}>
              <User className="h-5 w-5" />
            </Link>
            <Link to="/requests" className={linkClass}>
              <UserPlus className="h-5 w-5" />
            </Link>
            <Link to="/settings" className={linkClass}>
              <Settings className="h-5 w-5" />
            </Link>
          </>
        );
      case 'Lecturer':
        return (
          <>
            <Link to="/schedule" className={linkClass}>
              <Calendar className="h-5 w-5" />
            </Link>
            <Link to="/classes" className={linkClass}>
              <Users className="h-5 w-5" />
            </Link>
            <Link to="/attendance" className={linkClass}>
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/subject-assignments" className={linkClass}>
              <Book className="h-5 w-5" />
            </Link>
            <Link to="/materials" className={linkClass}>
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link to="/messages" className={linkClass}>
              <MessageSquare className="h-5 w-5" />
            </Link>
          </>
        );
      case 'Student':
        return (
          <>
            <Link to="/schedule" className={linkClass}>
              <Calendar className="h-5 w-5" />
            </Link>
            <Link to="/courses" className={linkClass}>
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link to="/attendance" className={linkClass}>
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/messages" className={linkClass}>
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
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            onClick={handleThemeToggle}
            size="small"
            sx={{ mr: 2 }}
            aria-label="toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </IconButton>
        </Tooltip>
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
          PaperProps={{
            sx: {
              bgcolor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
            }
          }}
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
    <div className="flex flex-col min-h-screen transition-colors duration-200"
      style={{ 
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)'
      }}
    >
      <header className="py-4 px-6 flex justify-between items-center transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
            Academic Scheduler
          </Link>
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
      
      <main className="flex-grow p-6 transition-colors duration-200"
        style={{ color: 'var(--color-text-primary)' }}
      >
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