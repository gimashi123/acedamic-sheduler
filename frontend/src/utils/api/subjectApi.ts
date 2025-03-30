import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Subject type definition
export interface Subject {
  _id: string;
  name: string;
  moduleCode: string;
  credit: number;
  description: string;
  department: string;
  faculty: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectData {
  name: string;
  moduleCode: string;
  credit: number;
  description?: string;
  department: string;
  faculty: string;
}

export interface UpdateSubjectData extends CreateSubjectData {
  _id: string;
}

// Get all subjects
export const getAllSubjects = async (): Promise<Subject[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get a single subject by ID
export const getSubjectById = async (id: string): Promise<Subject> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Create a new subject
export const createSubject = async (data: CreateSubjectData): Promise<Subject> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(`${API_URL}/subject`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Update a subject
export const updateSubject = async (id: string, data: CreateSubjectData): Promise<Subject> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.put(`${API_URL}/subject/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  
  await axios.delete(`${API_URL}/subject/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}; 