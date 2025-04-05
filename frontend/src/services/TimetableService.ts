import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Types for timetable management
export interface TimeSlot {
  _id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: any;
  venue: any;
  lecturer: any;
  isLocked?: boolean;
  manuallyAssigned?: boolean;
  score?: number;
}

export interface Timetable {
  _id?: string;
  group: any;
  month: number;
  year: number;
  timeSlots: TimeSlot[];
  generatedAt: string;
  status: 'draft' | 'published';
  preferredTimes?: any[];
  optimizationScore?: number;
  optimizationDetails?: {
    gapScore: number;
    distributionScore: number;
    preferenceScore: number;
  }
}

// Service for timetable management
const TimetableService = {
  // Generate timetable for a single group
  generateTimetable: async (groupId: string, month: number, year: number, forceRegenerate: boolean = false) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/generate`,
        { groupId, month, year, forceRegenerate },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  },

  // Generate timetables for all groups
  generateAllTimetables: async (month: number, year: number, forceRegenerate: boolean = false) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/generate-all`,
        { month, year, forceRegenerate },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating all timetables:', error);
      throw error;
    }
  },

  // Get all timetables (admin only)
  getAllTimetables: async () => {
    try {
      const response = await axios.get(`${API_URL}/timetables`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all timetables:', error);
      throw error;
    }
  },

  // Get timetables by group
  getTimetablesByGroup: async (groupId: string) => {
    try {
      const response = await axios.get(`${API_URL}/timetables/group/${groupId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting timetables by group:', error);
      throw error;
    }
  },

  // Get timetable by id
  getTimetableById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/timetables/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting timetable by id:', error);
      throw error;
    }
  },

  // Update timetable status
  updateTimetableStatus: async (id: string, status: 'draft' | 'published') => {
    try {
      const response = await axios.patch(
        `${API_URL}/timetables/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating timetable status:', error);
      throw error;
    }
  },

  // Delete timetable
  deleteTimetable: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/timetables/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw error;
    }
  },

  // Optimize timetable
  optimizeTimetable: async (timetableId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/${timetableId}/optimize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing timetable:', error);
      throw error;
    }
  },

  // Lock or unlock a time slot
  lockTimeSlot: async (timetableId: string, slotId: string, isLocked: boolean) => {
    try {
      const response = await axios.patch(
        `${API_URL}/timetables/${timetableId}/slot/${slotId}/lock`,
        { isLocked },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error locking/unlocking time slot:', error);
      throw error;
    }
  },

  // Manually assign a time slot
  assignTimeSlot: async (
    timetableId: string,
    subjectId: string,
    venueId: string,
    day: string,
    startTime: string,
    endTime: string
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/${timetableId}/assign`,
        {
          subjectId,
          venueId,
          day,
          startTime,
          endTime
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning time slot:', error);
      throw error;
    }
  },
};

export default TimetableService; 