import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Group type definition
export interface Group {
  _id: string;
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: 'weekday' | 'weekend';
  students: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: 'weekday' | 'weekend';
}

export interface UpdateGroupData extends CreateGroupData {
  _id?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface GroupFilters {
  faculty?: string;
  department?: string;
  year?: number;
  semester?: number;
  type?: 'weekday' | 'weekend';
}

// Get all faculties
export const getFaculties = async (): Promise<string[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/faculties`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get departments for a faculty
export const getDepartments = async (faculty: string): Promise<string[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/faculties/${faculty}/departments`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get groups by type
export const getGroupsByType = async (type: 'weekday' | 'weekend'): Promise<Group[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/type/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get groups by faculty
export const getGroupsByFaculty = async (faculty: string): Promise<Group[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/faculty/${faculty}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get groups by year and semester
export const getGroupsByYearAndSemester = async (year: number, semester: number): Promise<Group[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/year/${year}/semester/${semester}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get all groups with optional filters
export const getAllGroups = async (filters?: GroupFilters): Promise<Group[]> => {
  const token = localStorage.getItem('accessToken');
  
  let url = `${API_URL}/groups`;
  
  // Add query parameters if filters are provided
  if (filters) {
    const params = new URLSearchParams();
    if (filters.faculty) params.append('faculty', filters.faculty);
    if (filters.department) params.append('department', filters.department);
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.semester) params.append('semester', filters.semester.toString());
    if (filters.type) params.append('type', filters.type);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Get a single group by ID
export const getGroupById = async (id: string): Promise<Group> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Create a new group
export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(`${API_URL}/groups`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Update a group
export const updateGroup = async (id: string, data: CreateGroupData): Promise<Group> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.put(`${API_URL}/groups/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Delete a group
export const deleteGroup = async (id: string): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  
  await axios.delete(`${API_URL}/groups/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Get available students (students not in any group)
export const getAvailableStudents = async (): Promise<Student[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(`${API_URL}/groups/available-students`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Add students to a group
export const addStudentsToGroup = async (groupId: string, studentIds: string[]): Promise<Group> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(`${API_URL}/groups/${groupId}/students`, { studentIds }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
};

// Remove a student from a group
export const removeStudentFromGroup = async (groupId: string, studentId: string): Promise<Group> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.delete(`${API_URL}/groups/${groupId}/students/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.data;
}; 