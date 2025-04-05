import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Types for venue management
export interface Venue {
  _id: string;
  name: string;
  capacity: number;
  department: string;
  venueType: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive';
}

// Service for venue management
const VenueService = {
  // Get all venues
  getAllVenues: async () => {
    try {
      const response = await axios.get(`${API_URL}/venues`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all venues:', error);
      throw error;
    }
  },

  // Get venue by id
  getVenueById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/venues/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting venue by id:', error);
      throw error;
    }
  },

  // Create a new venue
  createVenue: async (venueData: Omit<Venue, '_id'>) => {
    try {
      const response = await axios.post(
        `${API_URL}/venues`,
        venueData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  },

  // Update a venue
  updateVenue: async (id: string, venueData: Partial<Venue>) => {
    try {
      const response = await axios.put(
        `${API_URL}/venues/${id}`,
        venueData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw error;
    }
  },

  // Delete a venue
  deleteVenue: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/venues/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting venue:', error);
      throw error;
    }
  },
};

export default VenueService; 