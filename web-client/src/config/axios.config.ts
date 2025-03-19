import axios, { InternalAxiosRequestConfig } from 'axios';

// Load environment variables for Vite
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;
const APP_NAME: string = import.meta.env.VITE_APP_NAME as string;

// Function to get a value from local storage
export const getLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
};

// Function to set a value in local storage
export const setLocalStorage = (key: string, value: string): void => {
    localStorage.setItem(key, value);
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
        const token = getLocalStorage(APP_NAME);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
