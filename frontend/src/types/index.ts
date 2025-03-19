export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isFirstLogin: boolean;
  passwordChangeRequired: boolean;
}

export interface Venue {
  id: string;
  faculty: string;
  department: string;
  building: string;
  hallName: string;
  type: 'lecture' | 'tutorial' | 'lab';
  capacity: number;
  bookedSlots: string[];
}

export interface Group {
  id: string;
  name: string;
  faculty: string;
  department: string;
  year: number;
  semester: number;
  groupType: 'weekday' | 'weekend';
  students: string[];
}

export interface UserRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  additionalDetails: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}