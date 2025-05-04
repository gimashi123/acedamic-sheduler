import { IUser, RemovedUser, User } from '@/data-types/user.tp.ts';
import api from '@/config/axios.config.ts';
import { ApiResponse } from '@/data-types/response.tp';
import axios from 'axios';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<IUser[]> => {
    try {
      const response = await api.get<ApiResponse<IUser[]>>(`/user`);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get users by role (Lecturer or Student)
  getUsersByRole: async (role: string): Promise<User[]> => {
    try {
      const response = await api.get<ApiResponse<User[]>>(
        `/user/by-role/${role}`,
      );

      return response.data.result || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching ${role}s:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
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
      const response =
        await api.get<ApiResponse<RemovedUser[]>>(`/user/removed`);

      // Validate response structure
      if (!response.data) {
        console.error('Invalid response format - missing data property');
        return [];
      }

      if (!response.data.result) {
        console.log('No removed users data returned from API');
        return [];
      }

      // Make sure response.data.data is an array before returning
      if (!Array.isArray(response.data.result)) {
        console.error(
          'Expected array of removed users but got:',
          typeof response.data.result,
        );
        return [];
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching removed users:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });

        // Check for specific error types
        if (error.response?.status === 401) {
          console.error(
            'Authentication error - token may be invalid or expired',
          );
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
      await api.delete(`/user/${userId}`, {
        data: { reason }, // Send reason in request body
      });
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  },

  // Update user details
  updateUser: async (
    userId: string,
    userData: { firstName?: string; lastName?: string; email?: string },
  ): Promise<IUser> => {
    try {
      const response = await api.put<ApiResponse<IUser>>(
        `/user/${userId}`,
        userData,
      );
      return response.data.result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};
