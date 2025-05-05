import api from '../../utils/api';
import { ITimetable, TimetableFormData } from '../../types/timetable';

// Get all timetables
export const getTimetables = async (): Promise<ITimetable[]> => {
  try {
    const response = await api.get('/timetable/get/all');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch timetables');
  } catch (error) {
    console.error('Error fetching timetables:', error);
    throw error;
  }
};

// Get a specific timetable by ID
export const getTimetableById = async (id: string): Promise<ITimetable> => {
  try {
    const response = await api.get(`/timetable/get/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch timetable');
  } catch (error) {
    console.error('Error fetching timetable:', error);
    throw error;
  }
};

// Create a new timetable
export const createTimetable = async (data: TimetableFormData): Promise<ITimetable> => {
  try {
    const response = await api.post('/timetable/create', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create timetable');
  } catch (error) {
    console.error('Error creating timetable:', error);
    throw error;
  }
};

// Update an existing timetable
export const updateTimetable = async (id: string, data: Partial<TimetableFormData>): Promise<ITimetable> => {
  try {
    const response = await api.put(`/timetable/update/${id}`, data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update timetable');
  } catch (error) {
    console.error('Error updating timetable:', error);
    throw error;
  }
};

// Delete a timetable
export const deleteTimetable = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/timetable/delete/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete timetable');
    }
  } catch (error) {
    console.error('Error deleting timetable:', error);
    throw error;
  }
}; 