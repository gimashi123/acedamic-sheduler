import api from './api';
import { RegistrationRequest, UserRequest, RequestStatus, ApiResponse } from '../types';

class RequestService {
  async submitRequest(request: RegistrationRequest): Promise<{ requestId: string }> {
    try {
      const response = await api.post<ApiResponse<{ requestId: string }>>('/request/submit', request);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit request');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to submit request');
      }
      throw error;
    }
  }

  async getRequestStatus(email: string): Promise<{ status: RequestStatus; createdAt: string }> {
    try {
      const response = await api.get<ApiResponse<{ status: RequestStatus; createdAt: string }>>(`/request/status/${email}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get request status');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get request status');
      }
      throw error;
    }
  }

  // Admin methods
  async getAllRequests(): Promise<UserRequest[]> {
    try {
      const response = await api.get<ApiResponse<UserRequest[]>>('/request/all');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get requests');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get requests');
      }
      throw error;
    }
  }

  async getRequestsByStatus(status: RequestStatus): Promise<UserRequest[]> {
    try {
      const response = await api.get<ApiResponse<UserRequest[]>>(`/request/status/${status}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get requests');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get requests');
      }
      throw error;
    }
  }

  async getRequestsByRole(role: string): Promise<UserRequest[]> {
    try {
      const response = await api.get<ApiResponse<UserRequest[]>>(`/request/role/${role}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get requests');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get requests');
      }
      throw error;
    }
  }

  async updateRequestStatus(requestId: string, status: RequestStatus): Promise<UserRequest> {
    try {
      const response = await api.put<ApiResponse<UserRequest>>(`/request/${requestId}`, { status });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update request status');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update request status');
      }
      throw error;
    }
  }

  async approveRequest(requestId: string): Promise<UserRequest & { defaultPassword?: string }> {
    try {
      const response = await api.put<ApiResponse<UserRequest & { defaultPassword?: string }>>(`/request/${requestId}`, { 
        status: 'Approved' 
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to approve request');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to approve request');
      }
      throw error;
    }
  }

  async rejectRequest(requestId: string, reason?: string): Promise<UserRequest> {
    try {
      const response = await api.put<ApiResponse<UserRequest>>(`/request/${requestId}`, { 
        status: 'Rejected',
        reason
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to reject request');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to reject request');
      }
      throw error;
    }
  }
}

export default new RequestService(); 