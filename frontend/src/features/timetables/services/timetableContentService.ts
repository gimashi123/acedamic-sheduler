import api from '../../../utils/api';

// Define Subject interface that matches the backend response
export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  lecturer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Define Schedule Entry interface
export interface ScheduleEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string | Subject;
  venue: string;
}

// Define Timetable Content interface
export interface TimetableContent {
  timetable: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  subjects: Subject[];
  schedule: ScheduleEntry[];
}

// Fetch all subjects available for timetables
export const fetchAllSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await api.get('/subjects/get/all');
    
    if (!response.data || !response.data.data) {
      return [];
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

// Fetch a specific timetable's content (subjects and schedule)
export const fetchTimetableContent = async (timetableId: string): Promise<TimetableContent> => {
  try {
    const response = await api.get(`/timetable/${timetableId}/content`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching timetable content:', error);
    throw error;
  }
};

// Save subjects to a timetable
export const saveSubjectsToTimetable = async (timetableId: string, subjectIds: string[]): Promise<TimetableContent> => {
  try {
    const response = await api.post(`/timetable/${timetableId}/subjects`, { subjects: subjectIds });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error saving subjects to timetable:', error);
    throw error;
  }
};

// Add a schedule entry to a timetable
export const addScheduleEntry = async (
  timetableId: string, 
  scheduleData: Omit<ScheduleEntry, 'id'>
): Promise<TimetableContent> => {
  try {
    const response = await api.post(`/timetable/${timetableId}/schedule`, scheduleData);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error adding schedule entry:', error);
    throw error;
  }
};

// Delete a schedule entry from a timetable
export const deleteScheduleEntry = async (
  timetableId: string,
  entryId: string
): Promise<TimetableContent> => {
  try {
    const response = await api.delete(`/timetable/${timetableId}/schedule/${entryId}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    throw error;
  }
};