import api from "@/config/axios.config";
import { IStudentRequest } from "@/data-types/student.tp";
import { toast } from "sonner";

const API_ENDPOINT = "/student";

// Get all students
export const getAllStudents = async () => {
  try {
    const response = await api.get(`${API_ENDPOINT}/get/all`);
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    toast.error("Failed to fetch students. Please try again later.");
    return [];
  }
};

// Get student by ID
export const getStudentById = async (id: string) => {
  try {
    const response = await api.get(`${API_ENDPOINT}/get/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    toast.error("Failed to fetch student details.");
    throw error;
  }
};

// Add a new student
export const addStudent = async (studentData: IStudentRequest) => {
  try {
    const response = await api.post(`${API_ENDPOINT}/add`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error);
    toast.error("Failed to add student. Please check all fields and try again.");
    throw error;
  }
};

// Update a student
export const updateStudent = async (id: string, studentData: IStudentRequest) => {
  try {
    const response = await api.put(`${API_ENDPOINT}/update/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    toast.error("Failed to update student. Please check all fields and try again.");
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id: string) => {
  try {
    const response = await api.delete(`${API_ENDPOINT}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    toast.error("Failed to delete student. Please try again later.");
    throw error;
  }
};