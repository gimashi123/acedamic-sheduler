import axios from "axios";
import { IStudentRequest } from "@/data-types/student.tp";

const API_URL = "http://localhost:5000/api/student";

// Get all students
export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/get/all`);
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get student by ID
export const getStudentById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/get/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    throw error;
  }
};

// Add a new student
export const addStudent = async (studentData: IStudentRequest) => {
  try {
    const response = await axios.post(`${API_URL}/add`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error);
    throw error;
  }
};

// Update a student
export const updateStudent = async (id: string, studentData: IStudentRequest) => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};