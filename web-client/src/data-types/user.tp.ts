export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isFirstLogin?: boolean;
  passwordChangeRequired?: boolean;
  profilePicture?: ProfilePicture;
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

export interface ProfilePicture {
  key: string | null;
  url: string | null;
}

export interface UserRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'lecturer' | 'Student' | 'Lecturer';
  additionalDetails?: string;
  isApproved: boolean;
  isEmailSent: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface RequestResponse {
  success: boolean;
  message: string;
  data?: UserRequest | UserRequest[];
}

export interface RequestActionResponse {
  success: boolean;
  message: string;
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

export type UserRole = 'Admin' | 'Lecturer' | 'Student';
