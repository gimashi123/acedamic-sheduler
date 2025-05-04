import { ApiResponse } from '@/data-types/response.tp.ts';
import api from '@/config/axios.config.ts';
import { IUser, UserRequest, UserRole } from '@/data-types/user.tp.ts';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
  passwordChangeRequired: boolean;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.result;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    additionalDetails?: string;
  }): Promise<{ requestId: string }> => {
    try {
      console.log('API Service - Registering user:', userData);
      const response = await api.post<ApiResponse<{ requestId: string }>>(
        '/request/submit',
        userData,
      );
      console.log('API Service - Registration response:', response.data);
      return response.data.result;
    } catch (error) {
      console.error('API Service - Registration error:', error);
      throw error;
    }
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  resetPassword: async (email: string): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/request-password-reset', {
      email,
    });
  },

  checkTokenValidity: async (): Promise<IUser> => {
    const response = await api.get<ApiResponse<IUser>>('/auth/me');
    return response.data.result;
  },
};

export const requestApi = {
  getAllRequests: async (): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>('/request');
    return response.data.result;
  },

  getRequestsByStatus: async (status: string): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>(
      `/request/status/${status}`,
    );
    return response.data.result;
  },

  getRequestsByRole: async (role: UserRole): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>(
      `/request/role/${role}`,
    );
    return response.data.result;
  },

  approveRequest: async (id: string): Promise<void> => {
    await api.post<ApiResponse<void>>(`/request/approve/${id}`);
  },

  rejectRequest: async (id: string, reason?: string): Promise<void> => {
    await api.post<ApiResponse<void>>(`/request/reject/${id}`, { reason });
  },

  checkRequestStatus: async (email: string): Promise<{ status: string }> => {
    const response = await api.get<ApiResponse<{ status: string }>>(
      `/request/status-by-email/${email}`,
    );
    return response.data.result;
  },
};
