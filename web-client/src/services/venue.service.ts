import api from '@/config/axios.config.ts';
import { VenueOptions } from '@/data-types/timetable.tp.ts';

// Fetch all venues
export const getVenues = async () => {
  try {
    const response = await api.get('/venue/get/all');
    return response.data.result;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

// Add a new venue
export const addVenue = async (venueData: any) => {
  try {
    const response = await api.post('/venue/add', venueData);
    return response.data.result;
  } catch (error) {
    console.error('Error adding venue:', error);
    throw error;
  }
};

// Update a venue
export const updateVenue = async (id: string, venueData: any) => {
  try {
    const response = await api.put(`/venue/update/${id}`, venueData);
    return response.data.result;
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
};

// Delete a venue
export const deleteVenue = async (id: string) => {
  try {
    await api.delete(`/venue/delete/${id}`);
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
};

// Fetch a venue by ID
export const getVenueById = async (id: string) => {
  try {
    const response = await api.get(`/venue/get/${id}`);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching venue by ID:', error);
    throw error;
  }
};

export const getVenueOptions = async () => {
  try {
    const response = await api.get('/venue/get/options');
    return response.data.result as VenueOptions[];
  } catch (error) {
    console.error('Error fetching venue options:', error);
    throw error;
  }
};
