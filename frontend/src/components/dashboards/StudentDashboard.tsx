import React, { useEffect } from 'react';
import { Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Typography } from '@mui/material';
import ProfilePicture from '../../components/ProfilePicture';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfilePicture } from '../../features/profile/profileSlice';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);

  useEffect(() => {
    if (user?.role === 'Student') {
      dispatch(fetchProfilePicture());
    }
  }, [user, dispatch]);

  if (!user || user.role !== 'Student') {
    return (
      <div className="p-4">
        <Typography color="error">Access denied. Student privileges required.</Typography>
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
            <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
            <p className="text-gray-600">View your class schedule and upcoming sessions</p>
          </Link>

          <Link to="/courses" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
            <BookOpen className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <p className="text-gray-600">Access your enrolled courses and materials</p>
          </Link>

          <Link to="/attendance" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
            <Clock className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
            <p className="text-gray-600">Track your attendance and participation</p>
          </Link>

          <Link to="/notifications" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors">
            <AlertCircle className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <p className="text-gray-600">Stay updated with important announcements</p>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          {/* Placeholder for upcoming sessions */}
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="text-gray-600">No upcoming sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 