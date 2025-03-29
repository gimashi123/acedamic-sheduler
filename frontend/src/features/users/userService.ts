import axios from 'axios';
import { User, ApiResponse, RemovedUser } from '../../types';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Using token:', token ? 'Token exists' : 'No token found');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get<ApiResponse<User[]>>(
        `${API_URL}/user`,
        getAuthHeader()
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get users by role (Lecturer or Student)
  getUsersByRole: async (role: string): Promise<User[]> => {
    try {
      console.log(`Fetching ${role}s from: ${API_URL}/user/by-role/${role}`);
      const response = await axios.get<ApiResponse<User[]>>(
        `${API_URL}/user/by-role/${role}`,
        getAuthHeader()
      );
      console.log(`Got ${role} response:`, response.data);
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching ${role}s:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error(`Error fetching ${role}s:`, error);
      }
      throw error;
    }
  },

  // Get removed users
  getRemovedUsers: async (): Promise<RemovedUser[]> => {
    try {
      console.log('Fetching removed users from API');
      const response = await axios.get<ApiResponse<RemovedUser[]>>(
        `${API_URL}/user/removed`,
        getAuthHeader()
      );
      console.log('Removed users API response status:', response.status);
      
      // Validate response structure
      if (!response.data) {
        console.error('Invalid response format - missing data property');
        return [];
      }

      if (!response.data.data) {
        console.log('No removed users data returned from API');
        return [];
      }
      
      // Make sure response.data.data is an array before returning
      if (!Array.isArray(response.data.data)) {
        console.error('Expected array of removed users but got:', typeof response.data.data);
        return [];
      }
      
      console.log(`Successfully fetched ${response.data.data.length} removed users`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching removed users:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Check for specific error types
        if (error.response?.status === 401) {
          console.error('Authentication error - token may be invalid or expired');
        }
      } else {
        console.error('Unknown error fetching removed users:', error);
      }
      throw error;
    }
  },

  // Remove a user
  removeUser: async (userId: string, reason?: string): Promise<boolean> => {
    try {
      await axios.delete(
        `${API_URL}/user/${userId}`,
        { 
          ...getAuthHeader(),
          data: { reason } // Send reason in request body
        }
      );
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  },
  
  // Update user details
  updateUser: async (userId: string, userData: { firstName?: string; lastName?: string; email?: string }): Promise<User> => {
    try {
      const response = await axios.put<ApiResponse<User>>(
        `${API_URL}/user/${userId}`,
        userData,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}; 