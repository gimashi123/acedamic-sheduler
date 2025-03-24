import axios from "axios";

const API_URL = "http://localhost:5000/api/venue"; // Adjust based on your backend

// Fetch all venues
export const getVenues = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

// Add a new venue
export const addVenue = async (venueData: any) => {
  try {
    const response = await axios.post(API_URL, venueData);
    return response.data;
  } catch (error) {
    console.error("Error adding venue:", error);
    throw error;
  }
};

// Update a venue
export const updateVenue = async (id: string, venueData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, venueData);
    return response.data;
  } catch (error) {
    console.error("Error updating venue:", error);
    throw error;
  }
};

// Delete a venue
export const deleteVenue = async (id: string) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting venue:", error);
    throw error;
  }
};
