import axios, { InternalAxiosRequestConfig } from 'axios';

// Load environment variables for Vite
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;
const APP_NAME: string = import.meta.env.VITE_APP_NAME as string;

// Define the structure of the stored data
export interface UserData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

// Function to get the user data from localStorage under the APP_NAME key
export const getLocalStorage = (): UserData | null => {
  const namespacedKey = `${APP_NAME}_userData`;
  const storedData = localStorage.getItem(namespacedKey);
  return storedData ? JSON.parse(storedData) : null;
};

// Function to set the user data in localStorage under the APP_NAME key
export const setLocalStorage = (data: UserData): void => {
  const namespacedKey = `${APP_NAME}_userData`;
  localStorage.setItem(namespacedKey, JSON.stringify(data));
};

export const removeLocalStorage = () => {
  const namespacedKey = `${APP_NAME}_userData`;
  localStorage.removeItem(namespacedKey);
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token (if it exists) to each request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const userData = getLocalStorage(); // Get the full user data
    if (userData && userData.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${userData.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
