import axios from 'axios';
import { User, ApiResponse } from '../../types';

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

  // Remove a user
  removeUser: async (userId: string): Promise<boolean> => {
    try {
      await axios.delete(
        `${API_URL}/user/${userId}`,
        getAuthHeader()
      );
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }
}; 