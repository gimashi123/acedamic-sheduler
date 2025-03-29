import axios from 'axios';
import { UserRequest, RequestActionResponse } from '../../types/request';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add authorization header to requests
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const requestService = {
  // Get all requests
  getAllRequests: async (): Promise<UserRequest[]> => {
    try {
      console.log('Fetching all requests from:', `${API_URL}/request/all`);
      const response = await axios.get(`${API_URL}/request/all`, getAuthHeader());
      console.log('All requests response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching all requests:', error);
      return [];
    }
  },

  // Get pending requests
  getPendingRequests: async (): Promise<UserRequest[]> => {
    try {
      console.log('Fetching pending requests from:', `${API_URL}/request/status/Pending`);
      const response = await axios.get(`${API_URL}/request/status/Pending`, getAuthHeader());
      console.log('Pending requests response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  // Approve a request
  approveRequest: async (requestId: string): Promise<RequestActionResponse> => {
    try {
      console.log('Approving request:', requestId);
      const response = await axios.post(`${API_URL}/request/approve/${requestId}`, {}, getAuthHeader());
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
      console.log('Rejecting request:', requestId);
      const response = await axios.post(`${API_URL}/request/reject/${requestId}`, {}, getAuthHeader());
      console.log('Reject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }
}; 