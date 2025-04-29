import axiosConfig from '@/config/axios.config.ts';
import { ISubjectRequest } from '@/data-types/subject.tp.ts';
import api from '@/config/axios.config.ts';

export const addSubject = async (addSubjectReq: ISubjectRequest) => {
  try {
    const response = await axiosConfig.post('/subject/add', addSubjectReq);

    if (response.data.success) {
      alert('successfully added subject');
    } else {
      alert('failed to add subject');
    }
  } catch (e: any) {
    alert(e.response.data.message || 'failed to add subject');
    console.log('failed to add subject:', e);
  }
};

export const deleteSubject = async (id: string) => {
  try {
    const response = await axiosConfig.delete(`/subject/delete/${id}`); // Make a DELETE request to the server
    if (response.data.success) {
      return response.data.result;
    }
  } catch (e) {
    console.error('Failed to delete subject', e);
  }
};

// Get subject by ID
export const getSubjectById = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/subject/get/${id}`);
    if (!response.ok) throw new Error('Failed to fetch subject');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subject:', error);
    throw error;
  }
};

// Update subject
export const updateSubject = async (id: string, subjectData: any) => {
  try {
    const response = await api.put(`/subject/update/${id}`, subjectData);

    if (!response.data.success) throw new Error('Failed to update subject');
    return response.data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};
