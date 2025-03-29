import api from "@/config/axios.config";
import { toast } from "sonner";

// Set your backend API URL - using the api instance from config
const API_ENDPOINT = "/group"; 

// Fetch all groups
export const getGroups = async () => {
  try {
    const response = await api.get(API_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    toast.error("Failed to fetch groups. Please try again later.");
    return [];
  }
};

// Add a new group
export const addGroup = async (groupData: any) => {
  try {
    const response = await api.post(API_ENDPOINT, groupData);
    return response.data;
  } catch (error) {
    console.error("Error adding group:", error);
    toast.error("Failed to add group. Please check all fields and try again.");
    throw error;
  }
};

// Update a group
export const updateGroup = async (id: string, groupData: any) => {
  try {
    const response = await api.put(`${API_ENDPOINT}/${id}`, groupData);
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error);
    toast.error("Failed to update group. Please check all fields and try again.");
    throw error;
  }
};

// Delete a group
export const deleteGroup = async (id: string) => {
  try {
    await api.delete(`${API_ENDPOINT}/${id}`);
  } catch (error) {
    console.error("Error deleting group:", error);
    toast.error("Failed to delete group. Please try again later.");
    throw error;
  }
};
