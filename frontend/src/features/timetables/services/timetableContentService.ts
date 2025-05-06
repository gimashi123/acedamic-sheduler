import api from '../../../utils/api';

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

export interface ScheduleEntry {
  id?: string;
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  venue?: string;
}

export interface TimetableContent {
  timetableId: string;
  subjects: string[];
  schedule: ScheduleEntry[];
}

// Fetch all available subjects
export const fetchAllSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await api.get('/subject/get/all');
    if (response.data.success) {
      return response.data.data.map((subject: any) => ({
        id: subject._id,
        name: subject.name,
        code: subject.code,
        credits: subject.credits,
        lecturer: subject.lecturer ? {
          id: subject.lecturer._id,
          firstName: subject.lecturer.firstName,
          lastName: subject.lecturer.lastName,
          email: subject.lecturer.email
        } : null
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

// Save subject selections to a timetable
export const saveSubjectsToTimetable = async (
  timetableId: string, 
  selectedSubjectIds: string[]
): Promise<void> => {
  try {
    await api.post(`/timetable/${timetableId}/subjects`, {
      subjectIds: selectedSubjectIds
    });
  } catch (error) {
    console.error('Error saving subjects to timetable:', error);
    throw error;
  }
};

// Add a schedule entry to a timetable
export const addScheduleEntry = async (
  timetableId: string,
  entry: Omit<ScheduleEntry, 'id'>
): Promise<ScheduleEntry> => {
  try {
    const response = await api.post(`/timetable/${timetableId}/schedule`, entry);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add schedule entry');
  } catch (error) {
    console.error('Error adding schedule entry:', error);
    throw error;
  }
};

// Get current timetable content
export const getTimetableContent = async (timetableId: string): Promise<TimetableContent | null> => {
  try {
    const response = await api.get(`/timetable/${timetableId}/content`);
    if (response.data.success) {
      return response.data.data;
    }
    
    // If content doesn't exist yet, return an empty structure
    return {
      timetableId,
      subjects: [],
      schedule: []
    };
  } catch (error) {
    console.error('Error fetching timetable content:', error);
    // Return empty structure as fallback
    return {
      timetableId,
      subjects: [],
      schedule: []
    };
  }
};

// Delete a schedule entry
export const deleteScheduleEntry = async (
  timetableId: string,
  entryId: string
): Promise<void> => {
  try {
    await api.delete(`/timetable/${timetableId}/schedule/${entryId}`);
  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    throw error;
  }
};