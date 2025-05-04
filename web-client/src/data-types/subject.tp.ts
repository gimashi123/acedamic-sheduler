export interface ISubject {
  id: string;
  name: string;
  code: string;
  credits: string;
}

export interface ISubjectRequest {
  name: string;
  code: string;
  credits: number;
}

export interface SubjectOptions {
  id: string;
  code: string;
  name: string;
  credits: number;
}
