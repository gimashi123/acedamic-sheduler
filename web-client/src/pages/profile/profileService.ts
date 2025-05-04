import axios from 'axios';

import api from '@/config/axios.config.ts';
import { ProfilePicture } from '@/data-types/user.tp';
import { ApiResponse } from '@/data-types/response.tp.ts';

export const profileService = {
  getProfilePicture: async (): Promise<ProfilePicture | null> => {
    try {
      // Add a timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await api.get<
        ApiResponse<{ profilePicture: ProfilePicture }>
      >(`/profile/profile-picture?t=${timestamp}`);

      // If the profile picture URL exists, add a cache-busting parameter
      if (
        response.data.result.profilePicture &&
        response.data.result.profilePicture.url
      ) {
        response.data.result.profilePicture.url = `${response.data.result.profilePicture.url}?t=${timestamp}`;
      }

      return response.data.result.profilePicture;
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

      const response = await api.post<
        ApiResponse<{ profilePicture: ProfilePicture }>
      >(`/profile/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add a timestamp to the URL to prevent caching
      if (
        response.data.result.profilePicture &&
        response.data.result.profilePicture.url
      ) {
        const timestamp = new Date().getTime();
        response.data.result.profilePicture.url = `${response.data.result.profilePicture.url}?t=${timestamp}`;
      }

      return response.data.result.profilePicture;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      // Log more detailed error information
      if (error.response) {
        // The request was made, and the server responded with a status code
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
      await api.delete(`/profile/profile-picture`);
      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  },

  // Admin: Update user's profile picture
  updateUserProfilePicture: async (
    userId: string,
    file: File,
  ): Promise<ProfilePicture | null> => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post<
        ApiResponse<{ profilePicture: ProfilePicture }>
      >(`/profile/profile-picture/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.result.profilePicture;
    } catch (error) {
      console.error('Error updating user profile picture:', error);
      throw error;
    }
  },
};
