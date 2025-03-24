import axios from "axios";

// Set your backend API URL
const API_URL = "http://localhost:5001/api/group"; // Change this if your backend URL is different

// Fetch all groups
export const getGroups = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

// Add a new group
export const addGroup = async (groupData: any) => {
  try {
    const response = await axios.post(API_URL, groupData);
    return response.data;
  } catch (error) {
    console.error("Error adding group:", error);
    throw error;
  }
};

// Update a group
export const updateGroup = async (id: string, groupData: any) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, groupData);
      return response.data;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };
  

// Delete a group
export const deleteGroup = async (id: string) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};
