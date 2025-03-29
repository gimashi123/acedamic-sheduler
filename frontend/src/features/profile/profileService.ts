import axios from 'axios';
import { ProfilePicture, ApiResponse } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      // Add a timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await axios.get<ApiResponse<{ profilePicture: ProfilePicture }>>(
        `${API_URL}/profile/profile-picture?t=${timestamp}`,
        getAuthHeader()
      );
      
      // If the profile picture URL exists, add a cache-busting parameter
      if (response.data.data.profilePicture && response.data.data.profilePicture.url) {
        response.data.data.profilePicture.url = `${response.data.data.profilePicture.url}?t=${timestamp}`;
      }
      
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
        `${API_URL}/profile/profile-picture`,
        formData,
        {
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Add a timestamp to the URL to prevent caching
      if (response.data.data.profilePicture && response.data.data.profilePicture.url) {
        const timestamp = new Date().getTime();
        response.data.data.profilePicture.url = `${response.data.data.profilePicture.url}?t=${timestamp}`;
      }
      
      return response.data.data.profilePicture;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  // Delete profile picture
  deleteProfilePicture: async (): Promise<boolean> => {
    try {
      await axios.delete(
        `${API_URL}/profile/profile-picture`,
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
        `${API_URL}/profile/profile-picture/${userId}`,
        formData,
        {
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