import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Add debug logging to identify port mismatch
console.log('API_URL from environment:', import.meta.env.VITE_API_URL);
console.log('Effective API_URL being used:', API_URL);

// Types
export interface SubjectAssignment {
  _id: string;
  subject: {
    _id: string;
    name: string;
    moduleCode: string;
    description?: string;
  };
  lecturer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  academicYear: string;
  semester: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentData {
  subjectId: string;
  lecturerId: string;
  academicYear: string;
  semester: number;
  notes?: string;
}

export interface UpdateAssignmentData {
  subjectId?: string;
  lecturerId?: string;
  academicYear?: string;
  semester?: number;
  notes?: string;
}

export interface Lecturer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// API Functions
export const getAllSubjectAssignments = async (): Promise<SubjectAssignment[]> => {
  const token = localStorage.getItem('accessToken');
  
  try {
    console.log('Making API request to get all subject assignments');
    const response = await axios.get(`${API_URL}/subject-assignments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.data || !response.data.data) {
      console.error('Invalid response format:', response.data);
      return [];
    }
    
    console.log('Subject assignments response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error in getAllSubjectAssignments:', error);
    throw error;
  }
};

export const getCurrentAssignments = async (academicYear: string, semester: number): Promise<SubjectAssignment[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject-assignments/current?academicYear=${academicYear}&semester=${semester}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const getLecturerAssignments = async (lecturerId: string): Promise<SubjectAssignment[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject-assignments/lecturer/${lecturerId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const getSubjectAssignments = async (subjectId: string): Promise<SubjectAssignment[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject-assignments/subject/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const getAssignmentById = async (id: string): Promise<SubjectAssignment> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/subject-assignments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const createAssignment = async (data: CreateAssignmentData): Promise<SubjectAssignment> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(`${API_URL}/subject-assignments`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const updateAssignment = async (id: string, data: UpdateAssignmentData): Promise<SubjectAssignment> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.put(`${API_URL}/subject-assignments/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  
  await axios.delete(`${API_URL}/subject-assignments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getAvailableLecturers = async (
  subjectId: string, 
  academicYear: string, 
  semester: number
): Promise<Lecturer[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(
    `${API_URL}/subject-assignments/available-lecturers?subjectId=${subjectId}&academicYear=${academicYear}&semester=${semester}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data.data;
};

// Function to check and clean up invalid assignments
export const checkAndCleanupAssignments = async (): Promise<boolean> => {
  const token = localStorage.getItem('accessToken');
  
  try {
    const response = await axios.get(`${API_URL}/subject-assignments?checkReferences=true`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Cleanup response:', response.data);
    return true;
  } catch (error) {
    console.error('Error cleaning up assignments:', error);
    return false;
  }
}; 