import React, { useState, useEffect } from 'react';
import { Users, Building2, Calendar, Settings, UserPlus, FileText, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestService } from '../../features/requests/requestService';
import { UserRequest } from '../../types/request';
import { format } from 'date-fns';
import { CircularProgress, Typography, Box } from '@mui/material';
import useAuthStore from '../../store/authStore';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfilePicture, setProfilePicture } from '../../features/profile/profileSlice';
import ProfilePicture from '../../components/ProfilePicture';
import { ProfilePicture as ProfilePictureType } from '../../types';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';

const AdminDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);

  const fetchPendingRequests = async () => {
    if (!user || user.role !== 'Admin') return;
    
    setIsLoading(true);
    try {
      const requests = await requestService.getPendingRequests();
      console.log('Fetched pending requests:', requests);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchPendingRequests();
      dispatch(fetchProfilePicture());
    }
  }, [user, dispatch]);

  const handleProfileUpdate = (newProfilePicture: ProfilePictureType | null) => {
    dispatch(setProfilePicture(newProfilePicture));
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="p-4">
        <Typography color="error">Access denied. Admin privileges required.</Typography>
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
              editable={true}
              onUpdate={(newProfilePic: ProfilePictureType | null) => {
                dispatch(setProfilePicture(newProfilePic));
              }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, Administrator!</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/users" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition-colors">
            <Users className="h-8 w-8 text-indigo-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </Link>

          <Link to="/venues" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
            <Building2 className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Venues</h3>
            <p className="text-gray-600">Manage classrooms and facilities</p>
          </Link>

          <Link to="/schedule" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
            <p className="text-gray-600">View and manage class schedules</p>
          </Link>

          <Link to="/requests" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
            <UserPlus className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Requests</h3>
            <p className="text-gray-600">Review and process user registration requests</p>
          </Link>

          <Link to="/reports" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors">
            <FileText className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            <p className="text-gray-600">Generate and view system reports</p>
          </Link>

          <Link to="/analytics" className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors">
            <BarChart className="h-8 w-8 text-red-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-gray-600">View system usage and performance metrics</p>
          </Link>

          <Link to="/settings" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-8 w-8 text-gray-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            <p className="text-gray-600">Configure system-wide settings</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent User Requests</h3>
            <button 
              onClick={fetchPendingRequests}
              className="text-purple-600 hover:text-purple-700"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : pendingRequests.length > 0 ? (
              pendingRequests.slice(0, 5).map((request) => (
                <div key={request._id} className="border-l-4 border-purple-500 pl-4">
                  <Typography variant="subtitle1" className="font-medium">
                    {request.firstName} {request.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {request.email} • {request.role}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Submitted: {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </div>
              ))
            ) : (
              <div className="border-l-4 border-gray-500 pl-4">
                <Typography color="textSecondary">No pending user requests</Typography>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <Typography color="textSecondary">All systems operational</Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 