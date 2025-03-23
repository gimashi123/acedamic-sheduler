import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box, 
  Button, 
  CircularProgress,
  Grid
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ProfilePicture from '../../components/ProfilePicture';
import { fetchProfilePicture, uploadProfilePicture, deleteProfilePicture } from './profileSlice';
import useAuthStore from '../../store/authStore';
import { AppDispatch } from '../../store/store';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const dispatch = useDispatch<AppDispatch>();
  const { profilePicture, loading, error } = useSelector((state: RootState) => state.profile);
  const [refreshKey, setRefreshKey] = useState(0); // Add a state variable to force re-render

  // Log profile picture info for debugging
  useEffect(() => {
    console.log('Current profile picture:', profilePicture);
  }, [profilePicture]);

  useEffect(() => {
    console.log('Fetching profile picture...');
    dispatch(fetchProfilePicture());
  }, [dispatch, refreshKey]); // Add refreshKey to dependencies

  const handleProfilePictureUpdate = async (file: File) => {
    try {
      console.log('Updating profile picture with file:', file);
      const result = await dispatch(uploadProfilePicture(file)).unwrap();
      console.log('Upload result:', result);
      toast.success('Profile picture updated successfully');
      
      // Force refetch of profile picture by updating the refresh key
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error in handleProfilePictureUpdate:', error);
      toast.error('Failed to update profile picture');
    }
  };

  const handleProfilePictureDelete = async () => {
    try {
      await dispatch(deleteProfilePicture()).unwrap();
      toast.success('Profile picture deleted successfully');
      
      // Force refetch of profile picture by updating the refresh key
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error in handleProfilePictureDelete:', error);
      toast.error('Failed to delete profile picture');
    }
  };

  if (!user) {
    return <CircularProgress />;
  }

  if (error) {
    toast.error(error);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent className="flex flex-col items-center">
              <Box className="mb-4">
                {loading ? (
                  <CircularProgress />
                ) : (
                  <ProfilePicture
                    profilePicture={profilePicture}
                    size="large"
                    editable={true}
                    onUpdate={(newPic) => {
                      // This is handled by the Redux thunk now
                    }}
                  />
                )}
              </Box>
              
              <Typography variant="h6" className="text-center">
                {user.firstName} {user.lastName}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" className="text-center">
                {user.email}
              </Typography>
              
              <Typography variant="body2" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mt-2">
                {user.role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider className="mb-4" />
              
              <Box className="space-y-4">
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    First Name
                  </Typography>
                  <Typography variant="body1">
                    {user.firstName}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1">
                    {user.lastName}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="subtitle2" color="textSecondary">
                    Role
                  </Typography>
                  <Typography variant="body1">
                    {user.role}
                  </Typography>
                </div>
              </Box>
              
              <Box className="mt-6">
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => window.location.href = '/change-password'}
                  className="mr-2"
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProfilePage; 