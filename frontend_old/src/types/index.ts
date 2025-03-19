// User roles
export enum Role {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
}

// User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  passwordChangeRequired?: boolean;
  defaultPassword?: string;
}

// Authentication response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration request
export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  additionalDetails?: string;
}

// Request status
export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// User request
export interface UserRequest {
  id: string;
  _id?: string; // Keep for backward compatibility
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  additionalDetails?: string;
  status: RequestStatus;
  isApproved: boolean;
  isEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
} 