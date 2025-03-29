export interface IStudent {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    degreeProgram: string;
    groupNumber: {
      _id: string;
      name: string;
    };
    subjectsEnrolled: Array<{
      _id: string;
      name: string;
      code: string;
    }>;
    dateOfBirth: string;
    guardianContact?: string;
    address?: string;
  }
  
  export interface IStudentRequest {
    studentId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    degreeProgram: string;
    groupNumber: string;
    subjectsEnrolled: string[];
    dateOfBirth: string;
    guardianContact?: string;
    address?: string;
  }