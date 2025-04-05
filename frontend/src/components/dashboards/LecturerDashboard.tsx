import React, { useEffect, useState } from 'react';
import { Calendar, Users, ClipboardList, MessageSquare, BookOpen, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Typography, Box, CircularProgress } from '@mui/material';
import ProfilePicture from '../../components/ProfilePicture';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfilePicture, setProfilePicture } from '../../features/profile/profileSlice';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';
import { ProfilePicture as ProfilePictureType } from '../../types';
import { getLecturerSubjects, Subject } from '../../features/subjects/subjectService';

const LecturerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const profilePicture = useSelector((state: RootState) => state.profile.profilePicture);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'Lecturer') {
      dispatch(fetchProfilePicture());
      
      // Fetch lecturer's subjects
      const fetchSubjects = async () => {
        try {
          setLoading(true);
          const subjectsData = await getLecturerSubjects();
          setSubjects(subjectsData);
          setError(null);
        } catch (err) {
          console.error('Error fetching subjects:', err);
          setError('Failed to load subjects. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSubjects();
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
              editable={true}
              onUpdate={(newProfilePic: ProfilePictureType | null) => {
                dispatch(setProfilePicture(newProfilePic));
              }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h2>
              <p className="text-gray-600">Welcome, {user.firstName}!</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* My Subjects Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h3>
          {loading ? (
            <div className="flex justify-center p-4">
              <CircularProgress size={24} />
            </div>
          ) : error ? (
            <div className="text-red-500 p-2">{error}</div>
          ) : subjects.length > 0 ? (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="text-lg font-medium text-gray-900">{subject.name} ({subject.code})</h4>
                  {subject.description && <p className="text-gray-600 mt-1">{subject.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subject.department && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {subject.department}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {subject.credits} Credits
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subject.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subject.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You haven't added any subjects yet. 
                    <Link to="/subjects" className="font-medium underline ml-1">
                      Add a subject now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
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

          <Link to="/subjects" className="bg-amber-50 p-6 rounded-lg hover:bg-amber-100 transition-colors">
            <BookOpenCheck className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">My Subjects</h3>
            <p className="text-gray-600">Add and manage your teaching subjects</p>
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