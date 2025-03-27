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
