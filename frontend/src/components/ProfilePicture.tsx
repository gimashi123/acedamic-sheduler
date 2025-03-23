import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Badge, 
  Tooltip, 
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Person, 
  PhotoCamera, 
  Warning 
} from '@mui/icons-material';
import { ProfilePicture as ProfilePictureType } from '../types';
import { profileService } from '../features/profile/profileService';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { uploadProfilePicture, deleteProfilePicture, fetchProfilePicture } from '../features/profile/profileSlice';
import { AppDispatch } from '../store/store';

interface ProfilePictureProps {
  profilePicture: ProfilePictureType | undefined | null;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  userId?: string;
  onUpdate?: (profilePicture: ProfilePictureType | null) => void;
  isAdmin?: boolean;
}

const getAvatarSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 40;
    case 'large':
      return 120;
    case 'medium':
    default:
      return 56;
  }
};

// We'll use the Material-UI Avatar fallback instead of a custom default image
const defaultPicUrl = '';

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
  size = 'medium',
  editable = false,
  userId,
  onUpdate,
  isAdmin = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const avatarSize = getAvatarSize(size);
  const dispatch = useDispatch<AppDispatch>();
  // Generate a unique ID for the file input to avoid conflicts
  const fileInputId = React.useMemo(() => `profile-pic-upload-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Update the image source when the profilePicture prop changes
  useEffect(() => {
    if (profilePicture?.url) {
      // Add a timestamp parameter to avoid browser caching
      const timestamp = new Date().getTime();
      setImgSrc(`${profilePicture.url}${profilePicture.url.includes('?') ? '&' : '?'}t=${timestamp}`);
    } else {
      setImgSrc(defaultPicUrl);
    }
  }, [profilePicture]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG and PNG files are allowed');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isAdmin && userId) {
        // Admin updating a user's profile picture
        const newProfilePicture = await profileService.updateUserProfilePicture(userId, file);
        toast.success('User profile picture updated successfully');
        if (onUpdate) {
          onUpdate(newProfilePicture);
        }
      } else {
        // User updating their own profile picture
        console.log('Uploading profile picture...', file);
        const result = await dispatch(uploadProfilePicture(file)).unwrap();
        console.log('Upload result:', result);
        
        // Manually update the image source with the new URL and a cache-busting parameter
        if (result && result.url) {
          const timestamp = new Date().getTime();
          setImgSrc(`${result.url}${result.url.includes('?') ? '&' : '?'}t=${timestamp}`);
        }
        
        toast.success('Profile picture updated successfully');
        
        // Force a refetch to ensure state is consistent
        setTimeout(() => {
          dispatch(fetchProfilePicture());
        }, 500);
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      
      // More detailed error messages
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePicture = async () => {
    if (!profilePicture?.key) return;
    setDeleteDialogOpen(true);
  };

  const confirmDeletePicture = async () => {
    setDeleteDialogOpen(false);
    setLoading(true);
    
    try {
      if (isAdmin && userId) {
        // Admin deleting a user's profile picture
        await profileService.deleteProfilePicture();
        toast.success('User profile picture deleted successfully');
        if (onUpdate) {
          onUpdate(null);
        }
      } else {
        // User deleting their own profile picture
        await dispatch(deleteProfilePicture()).unwrap();
        toast.success('Profile picture deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('Failed to delete profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeletePicture = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <div className="relative inline-block">
      {editable ? (
        <div className="relative">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              loading ? (
                <CircularProgress size={20} />
              ) : profilePicture?.url ? (
                <Tooltip title="Delete picture">
                  <div
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer shadow-md"
                    onClick={handleDeletePicture}
                    style={{ zIndex: 10 }}
                  >
                    <Delete fontSize="small" />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip title="Upload picture">
                  <label
                    htmlFor={fileInputId}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-md"
                    style={{ zIndex: 10 }}
                  >
                    <Add fontSize="small" />
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </Tooltip>
              )
            }
          >
            <div className="relative group">
              <Avatar
                src={imgSrc}
                alt="Profile"
                sx={{ width: avatarSize, height: avatarSize, bgcolor: 'primary.main' }}
              >
                {!imgSrc && <Person />}
              </Avatar>
              
              {!loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Tooltip title={profilePicture?.url ? "Change picture" : "Upload picture"}>
                    <label
                      htmlFor={`${fileInputId}-hover`}
                      className="cursor-pointer text-white"
                    >
                      <PhotoCamera />
                      <input
                        id={`${fileInputId}-hover`}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </Tooltip>
                </div>
              )}
            </div>
          </Badge>
        </div>
      ) : (
        <Avatar
          src={imgSrc}
          alt="Profile"
          sx={{ width: avatarSize, height: avatarSize, bgcolor: 'primary.main' }}
        >
          {!imgSrc && <Person />}
        </Avatar>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeletePicture}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="flex items-center">
          <Warning color="warning" className="mr-2" /> Delete Profile Picture
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete your profile picture? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeletePicture} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeletePicture} 
            color="error" 
            variant="contained" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfilePicture; 