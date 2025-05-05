import axios from 'axios';
import api from '../../utils/api';
import { Subject } from '../../types';

const API_URL = `${import.meta.env.VITE_API_URL}/subjects`;

export interface SubjectFormData {
  name: string;
  code: string;
  credits: number;
}

// Add a new subject
export const addSubject = async (subjectData: SubjectFormData): Promise<Subject> => {
  try {
    const response = await api.post(`/subjects/add`, subjectData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error in addSubject service:', error);
    throw error;
  }
};

// Get all subjects
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await api.get(`/subjects/get/all`);
    
    if (!response.data || !response.data.data) {
      return [];
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error in getSubjects service:', error);
    throw error;
  }
};

// Get subject by ID
export const getSubjectById = async (id: string): Promise<Subject> => {
  try {
    const response = await api.get(`/subjects/get/${id}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error in getSubjectById service:', error);
    throw error;
  }
};

// Update a subject
export const updateSubject = async (id: string, subjectData: Partial<SubjectFormData>): Promise<Subject> => {
  try {
    const response = await api.put(`/subjects/update/${id}`, subjectData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error in updateSubject service:', error);
    throw error;
  }
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/subjects/delete/${id}`);
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