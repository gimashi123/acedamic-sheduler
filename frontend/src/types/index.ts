export type UserRole = 'Admin' | 'Lecturer' | 'Student';

export interface ProfilePicture {
  key: string | null;
  url: string | null;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isFirstLogin: boolean;
  passwordChangeRequired: boolean;
  profilePicture?: ProfilePicture;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface Venue {
  _id: string;
  faculty: string;
  department: string;
  building: string;
  hallName: string;
  type: 'lecture' | 'tutorial' | 'lab';
  capacity: number;
  bookedSlots: string[];
}

export interface Group {
  _id: string;
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: 'weekday' | 'weekend';
  students: string[];
}

export interface UserRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  additionalDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  passwordChangeRequired: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RemovedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  removedAt: string;
  removedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reason: string;
  createdAt: string;
  updatedAt: string;
}