import React, { useState } from 'react';
import { Avatar, Badge, Tooltip, CircularProgress } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { ProfilePicture as ProfilePictureType } from '../types';
import { profileService } from '../features/profile/profileService';

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

const defaultPicUrl = '/default-avatar.png';

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
  size = 'medium',
  editable = false,
  userId,
  onUpdate,
  isAdmin = false,
}) => {
  const [loading, setLoading] = useState(false);
  const avatarSize = getAvatarSize(size);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPEG, JPG and PNG files are allowed');
      return;
    }
    
    setLoading(true);
    
    try {
      let newProfilePicture: ProfilePictureType | null = null;
      
      if (isAdmin && userId) {
        // Admin updating a user's profile picture
        newProfilePicture = await profileService.updateUserProfilePicture(userId, file);
      } else {
        // User updating their own profile picture
        newProfilePicture = await profileService.uploadProfilePicture(file);
      }
      
      if (onUpdate) {
        onUpdate(newProfilePicture);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePicture = async () => {
    if (!profilePicture?.key) return;
    
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await profileService.deleteProfilePicture();
      
      if (onUpdate) {
        onUpdate(null);
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      alert('Failed to delete profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative inline-block">
      {editable ? (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            loading ? (
              <CircularProgress size={20} />
            ) : profilePicture?.url ? (
              <Tooltip title="Delete picture">
                <div
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer"
                  onClick={handleDeletePicture}
                >
                  <Delete fontSize="small" />
                </div>
              </Tooltip>
            ) : (
              <Tooltip title="Upload picture">
                <label
                  htmlFor="profile-pic-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 cursor-pointer"
                >
                  <Add fontSize="small" />
                  <input
                    id="profile-pic-upload"
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
          <Avatar
            src={profilePicture?.url || defaultPicUrl}
            alt="Profile"
            sx={{ width: avatarSize, height: avatarSize }}
          />
        </Badge>
      ) : (
        <Avatar
          src={profilePicture?.url || defaultPicUrl}
          alt="Profile"
          sx={{ width: avatarSize, height: avatarSize }}
        />
      )}
    </div>
  );
};

export default ProfilePicture; 