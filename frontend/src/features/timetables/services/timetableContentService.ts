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
  subjectId?: string; // For backward compatibility with backend
  venue: string;
}

// Define Timetable Content interface
export interface TimetableContent {
  timetable?: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  subjects: (Subject | string)[];
  schedule: ScheduleEntry[];
}

// Fetch all subjects available for timetables
export const fetchAllSubjects = async (): Promise<Subject[]> => {
  try {
    // Use the correct endpoint based on your API structure
    const response = await api.get('/subject/get/all');
    
    if (!response.data || !response.data.data) {
      console.log('Empty or invalid response from server:', response);
      throw new Error('Invalid response format from server');
    }
    
    if (response.data.data.length === 0) {
      console.log('Server returned zero subjects');
    }
    
    // Transform backend response to match our Subject interface
    return response.data.data.map((subject: any) => ({
      id: subject._id || subject.id,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      lecturer: subject.lecturer ? {
        id: subject.lecturer._id || subject.lecturer.id,
        firstName: subject.lecturer.firstName,
        lastName: subject.lecturer.lastName,
        email: subject.lecturer.email
      } : null
    }));
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    
    // Provide more informative error message based on the error type
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Could not connect to the backend server. Please ensure the server is running.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('No subjects found in the database. Please add subjects first.');
    }
    
    throw new Error(error.message || 'Failed to fetch subjects');
  }
};

// Fetch a specific timetable's content (subjects and schedule)
export const fetchTimetableContent = async (timetableId: string): Promise<TimetableContent> => {
  try {
    const response = await api.get(`/timetable/${timetableId}/content`);
    
    if (!response.data || !response.data.data) {
      // Return empty content instead of throwing
      return {
        subjects: [],
        schedule: []
      };
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching timetable content:', error);
    
    // More specific error handling
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend server may not be running');
      throw new Error('Could not connect to the backend server. Please ensure the server is running.');
    }
    
    if (error.response?.status === 404) {
      console.error('Timetable content not found');
    }
    
    // Return empty content as fallback
    return {
      subjects: [],
      schedule: []
    };
  }
};

// Save subjects to a timetable
export const saveSubjectsToTimetable = async (timetableId: string, subjectIds: string[]): Promise<TimetableContent> => {
  try {
    const response = await api.post(`/timetable/${timetableId}/subjects`, { subjectIds: subjectIds });
    
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
  scheduleData: any // Using any to accommodate potential mismatches between frontend/backend
): Promise<TimetableContent> => {
  try {
    // Convert subject to subjectId if needed for backend compatibility
    const payload = { ...scheduleData };
    
    // Handle the case where subject might be a string ID or an object
    if (payload.subject && typeof payload.subject === 'object') {
      payload.subjectId = payload.subject.id;
      delete payload.subject;
    } else if (typeof payload.subject === 'string') {
      payload.subjectId = payload.subject;
      delete payload.subject;
    }
    
    const response = await api.post(`/timetable/${timetableId}/schedule`, payload);
    
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