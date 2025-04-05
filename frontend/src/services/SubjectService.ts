import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Types for subject management
export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  lecturer: any;
  credits: number;
  department: string;
  status: 'active' | 'inactive';
  priority: number;
  preferredDays?: string[];
  preferredTimeRanges?: { startTime: string; endTime: string }[];
  sessionDuration?: number;
  requiredVenueTypes?: string[];
}

// Service for subject management
const SubjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all subjects:', error);
      throw error;
    }
  },

  // Get subject by id
  getSubjectById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/subjects/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting subject by id:', error);
      throw error;
    }
  },

  // Create a new subject
  createSubject: async (subjectData: Omit<Subject, '_id'>) => {
    try {
      const response = await axios.post(
        `${API_URL}/subjects`,
        subjectData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  // Update a subject
  updateSubject: async (id: string, subjectData: Partial<Subject>) => {
    try {
      const response = await axios.put(
        `${API_URL}/subjects/${id}`,
        subjectData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete a subject
  deleteSubject: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/subjects/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },
};

export default SubjectService; 