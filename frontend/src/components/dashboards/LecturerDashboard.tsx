import React, { useEffect } from 'react';
import { Calendar, Users, ClipboardList, MessageSquare, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Typography } from '@mui/material';
import ProfilePicture from '../../components/ProfilePicture';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfilePicture } from '../../features/profile/profileSlice';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';

const LecturerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);

  useEffect(() => {
    if (user?.role === 'Lecturer') {
      dispatch(fetchProfilePicture());
    }
  }, [user, dispatch]);

  if (!user || user.role !== 'Lecturer') {
    return (
      <div className="p-4">
        <Typography color="error">Access denied. Lecturer privileges required.</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <ProfilePicture
              profilePicture={profilePicture}
              size="large"
              editable={false}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName}!</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/schedule" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition-colors">
            <Calendar className="h-8 w-8 text-indigo-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Teaching Schedule</h3>
            <p className="text-gray-600">View and manage your teaching schedule</p>
          </Link>

          <Link to="/classes" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
            <p className="text-gray-600">Manage your classes and students</p>
          </Link>

          <Link to="/attendance" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
            <ClipboardList className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
            <p className="text-gray-600">Take attendance and view records</p>
          </Link>

          <Link to="/materials" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
            <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Teaching Materials</h3>
            <p className="text-gray-600">Upload and manage course materials</p>
          </Link>

          <Link to="/messages" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors">
            <MessageSquare className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <p className="text-gray-600">Communicate with your students</p>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h3>
        <div className="space-y-4">
          {/* Placeholder for today's classes */}
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="text-gray-600">No classes scheduled for today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard; 