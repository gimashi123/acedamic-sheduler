import axios from 'axios';
import api from '../../utils/api';

const API_URL = `${import.meta.env.VITE_API_URL}/subjects`;

export interface Subject {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  lecturer: string;
  credits?: number;
  department?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectFormData {
  name: string;
  code: string;
  description?: string;
  credits?: number;
  department?: string;
}

// Create a new subject
export const createSubject = async (subjectData: SubjectFormData): Promise<Subject> => {
  try {
    console.log('Creating subject with data:', subjectData);
    const response = await api.post(`/subjects`, subjectData);
    console.log('Create subject response:', response.data);
    
    if (!response.data || !response.data.subject) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.subject;
  } catch (error) {
    console.error('Error in createSubject service:', error);
    throw error;
  }
};

// Get all subjects (admin only)
export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await api.get(`/subjects/all`);
    
    if (!response.data || !response.data.subjects) {
      console.error('Invalid response format:', response.data);
      return [];
    }
    
    return response.data.subjects;
  } catch (error) {
    console.error('Error in getAllSubjects service:', error);
    throw error;
  }
};

// Get subjects for the logged-in lecturer
export const getLecturerSubjects = async (): Promise<Subject[]> => {
  try {
    console.log('Fetching lecturer subjects');
    const response = await api.get(`/subjects/my-subjects`);
    console.log('Lecturer subjects response:', response.data);
    
    if (!response.data || !response.data.subjects) {
      console.error('Invalid response format:', response.data);
      return [];
    }
    
    return response.data.subjects;
  } catch (error) {
    console.error('Error in getLecturerSubjects service:', error);
    throw error;
  }
};

// Update a subject
export const updateSubject = async (id: string, subjectData: Partial<SubjectFormData>): Promise<Subject> => {
  try {
    const response = await api.put(`/subjects/${id}`, subjectData);
    
    if (!response.data || !response.data.subject) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.subject;
  } catch (error) {
    console.error('Error in updateSubject service:', error);
    throw error;
  }
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/subjects/${id}`);
    return { 
      success: true, 
      message: response.data?.message || 'Subject deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error in deleteSubject service:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete subject'
    };
  }
}; 