import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Venue type definition
export interface Venue {
  _id: string;
  faculty: string;
  department: string;
  building: string;
  hallName: string;
  type: 'lecture' | 'tutorial' | 'lab';
  capacity: number;
  bookedSlots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueData {
  faculty: string;
  department: string;
  building: string;
  hallName: string;
  type: 'lecture' | 'tutorial' | 'lab';
  capacity: number;
}

export interface UpdateVenueData extends CreateVenueData {
  _id: string;
}

// Get all venues
export const getAllVenues = async (): Promise<Venue[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/venue`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get a single venue by ID
export const getVenueById = async (id: string): Promise<Venue> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/venue/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Create a new venue
export const createVenue = async (data: CreateVenueData): Promise<Venue> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(`${API_URL}/venue`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Update a venue
export const updateVenue = async (id: string, data: CreateVenueData): Promise<Venue> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.put(`${API_URL}/venue/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Delete a venue
export const deleteVenue = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  
  await axios.delete(`${API_URL}/venue/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}; 