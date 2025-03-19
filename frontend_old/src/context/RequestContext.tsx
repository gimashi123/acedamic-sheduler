import React, { createContext, useContext, useState, ReactNode } from 'react';
import requestService from '../services/request.service';
import { RegistrationRequest, UserRequest, RequestStatus } from '../types';

interface RequestContextType {
  requests: UserRequest[];
  loading: boolean;
  error: string | null;
  submitRequest: (request: RegistrationRequest) => Promise<string>;
  getRequestStatus: (email: string) => Promise<{ status: RequestStatus; createdAt: string }>;
  getAllRequests: () => Promise<UserRequest[]>;
  getRequestsByStatus: (status: RequestStatus) => Promise<void>;
  getRequestsByRole: (role: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  approveRequest: (requestId: string) => Promise<{ defaultPassword?: string }>;
  rejectRequest: (requestId: string, reason?: string) => Promise<void>;
  clearError: () => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const useRequest = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
};

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (request: RegistrationRequest): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.submitRequest(request);
      return response.requestId;
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatus = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      return await requestService.getRequestStatus(email);
    } catch (err: any) {
      setError(err.message || 'Failed to get request status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllRequests = async (): Promise<UserRequest[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.getAllRequests();
      setRequests(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to get requests');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByStatus = async (status: RequestStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.getRequestsByStatus(status);
      setRequests(response);
    } catch (err: any) {
      setError(err.message || 'Failed to get requests');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRequestsByRole = async (role: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.getRequestsByRole(role);
      setRequests(response);
    } catch (err: any) {
      setError(err.message || 'Failed to get requests');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    try {
      setLoading(true);
      setError(null);
      await requestService.updateRequestStatus(requestId, status);
      // Refresh the requests list
      await getAllRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update request status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string): Promise<{ defaultPassword?: string }> => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestService.approveRequest(requestId);
      // Refresh the requests list
      await getAllRequests();
      // Return the default password if it exists
      return { defaultPassword: response.defaultPassword };
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      await requestService.rejectRequest(requestId, reason);
      // Refresh the requests list
      await getAllRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    requests,
    loading,
    error,
    submitRequest,
    getRequestStatus,
    getAllRequests,
    getRequestsByStatus,
    getRequestsByRole,
    updateRequestStatus,
    approveRequest,
    rejectRequest,
    clearError,
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}; 