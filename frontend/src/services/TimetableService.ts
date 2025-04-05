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
}

export interface Timetable {
  _id?: string;
  group: any;
  month: number;
  year: number;
  timeSlots: TimeSlot[];
  generatedAt: string;
  status: 'draft' | 'published';
}

// Service for timetable management
const TimetableService = {
  // Generate timetable for a single group
  generateTimetable: async (groupId: string, month: number, year: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/generate`,
        { groupId, month, year },
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
  generateAllTimetables: async (month: number, year: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/timetables/generate-all`,
        { month, year },
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
};

export default TimetableService; 