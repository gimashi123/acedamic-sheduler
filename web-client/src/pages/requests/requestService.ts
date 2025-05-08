import api from '@/config/axios.config.ts';
import { RequestActionResponse, UserRequest } from '@/data-types/user.tp.ts';

export const requestService = {
  // Get all requests
  getAllRequests: async (): Promise<UserRequest[]> => {
    try {
      const response = await api.get(`/request/all`);
      console.log('All requests response:', response.data);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching all requests:', error);
      return [];
    }
  },

  // Get pending requests
  getPendingRequests: async (): Promise<UserRequest[]> => {
    try {
      const response = await api.get(`/request/status/Pending`);
      console.log('Pending requests response:', response.data);
      return response.data.result || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  // Approve a request
  approveRequest: async (requestId: string): Promise<RequestActionResponse> => {
    try {
      const response = await api.post(`/request/approve/${requestId}`);
      console.log('Approve response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  // Reject a request
  rejectRequest: async (requestId: string): Promise<RequestActionResponse> => {
    try {
      const response = await api.post(`/request/reject/${requestId}`);
      console.log('Reject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },
};
