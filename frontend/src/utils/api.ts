import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, User, UserRequest, Venue, Group, ApiResponse, UserRole } from '../types';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig<any> {
  _retry?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post<ApiResponse<{accessToken: string}>>(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { 
      email, 
      password 
    });
    return response.data.data;
  },
  
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    additionalDetails?: string;
  }): Promise<{requestId: string}> => {
    try {
      console.log('API Service - Registering user:', userData);
      const response = await api.post<ApiResponse<{requestId: string}>>('/request/submit', userData);
      console.log('API Service - Registration response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('API Service - Registration error:', error);
      throw error;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword });
  },
  
  resetPassword: async (email: string): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/request-password-reset', { email });
  },
  
  checkTokenValidity: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }
};

// User API calls
export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      // Try the standard endpoint first
      const response = await api.get<ApiResponse<User[]>>('/user');
      return response.data.data;
    } catch (error) {
      console.log('Error with /user endpoint, trying alternate endpoints');
      
      try {
        // Try alternate endpoints
        const response = await api.get<ApiResponse<User[]>>('/user/all');
        return response.data.data;
      } catch (secondError) {
        console.error('All user endpoints failed:', secondError);
        // Return empty array to prevent dashboard breaking
        return [];
      }
    }
  },
  
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/user/${id}`);
    return response.data.data;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/user/${id}`);
  },
  
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/user/${id}`, userData);
    return response.data.data;
  }
};

// Request API calls
export const requestApi = {
  getAllRequests: async (): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>('/request');
    return response.data.data;
  },
  
  getRequestsByStatus: async (status: string): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>(`/request/status/${status}`);
    return response.data.data;
  },
  
  getRequestsByRole: async (role: UserRole): Promise<UserRequest[]> => {
    const response = await api.get<ApiResponse<UserRequest[]>>(`/request/role/${role}`);
    return response.data.data;
  },
  
  approveRequest: async (id: string): Promise<void> => {
    await api.post<ApiResponse<void>>(`/request/approve/${id}`);
  },
  
  rejectRequest: async (id: string, reason?: string): Promise<void> => {
    await api.post<ApiResponse<void>>(`/request/reject/${id}`, { reason });
  },
  
  checkRequestStatus: async (email: string): Promise<{ status: string }> => {
    const response = await api.get<ApiResponse<{ status: string }>>(`/request/status-by-email/${email}`);
    return response.data.data;
  }
};

// Venue API calls
export const venueApi = {
  getAllVenues: async (): Promise<Venue[]> => {
    const response = await api.get<ApiResponse<Venue[]>>('/venue');
    return response.data.data;
  },
  
  getVenueById: async (id: string): Promise<Venue> => {
    const response = await api.get<ApiResponse<Venue>>(`/venue/${id}`);
    return response.data.data;
  },
  
  createVenue: async (venueData: Omit<Venue, '_id'>): Promise<Venue> => {
    const response = await api.post<ApiResponse<Venue>>('/venue', venueData);
    return response.data.data;
  },
  
  updateVenue: async (id: string, venueData: Partial<Venue>): Promise<Venue> => {
    const response = await api.put<ApiResponse<Venue>>(`/venue/${id}`, venueData);
    return response.data.data;
  },
  
  deleteVenue: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/venue/${id}`);
  }
};

// Group API calls
export const groupApi = {
  getAllGroups: async (): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>('/group');
    return response.data.data;
  },
  
  getGroupById: async (id: string): Promise<Group> => {
    const response = await api.get<ApiResponse<Group>>(`/group/${id}`);
    return response.data.data;
  },
  
  createGroup: async (groupData: Omit<Group, '_id'>): Promise<Group> => {
    const response = await api.post<ApiResponse<Group>>('/group', groupData);
    return response.data.data;
  },
  
  updateGroup: async (id: string, groupData: Partial<Group>): Promise<Group> => {
    const response = await api.put<ApiResponse<Group>>(`/group/${id}`, groupData);
    return response.data.data;
  },
  
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/group/${id}`);
  }
};

export default api; 