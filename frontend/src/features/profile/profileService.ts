import axios from 'axios';
import { ProfilePicture, ApiResponse } from '../../types';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const profileService = {
  // Get profile picture
  getProfilePicture: async (): Promise<ProfilePicture | null> => {
    try {
      const response = await axios.get<ApiResponse<{ profilePicture: ProfilePicture }>>(
        `${API_URL}/profile/picture`,
        getAuthHeader()
      );
      return response.data.data.profilePicture;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<ProfilePicture | null> => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post<ApiResponse<{ profilePicture: ProfilePicture }>>(
        `${API_URL}/profile/picture/upload`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data.profilePicture;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },

  // Delete profile picture
  deleteProfilePicture: async (): Promise<boolean> => {
    try {
      await axios.delete(
        `${API_URL}/profile/picture`,
        getAuthHeader()
      );
      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  // Admin: Update user's profile picture
  updateUserProfilePicture: async (userId: string, file: File): Promise<ProfilePicture | null> => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post<ApiResponse<{ profilePicture: ProfilePicture }>>(
        `${API_URL}/profile/picture/user/${userId}/upload`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data.profilePicture;
    } catch (error) {
      console.error('Error updating user profile picture:', error);
      throw error;
    }
  }
}; 