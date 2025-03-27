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
}
