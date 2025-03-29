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