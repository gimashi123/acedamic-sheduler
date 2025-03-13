import axios from 'axios';

// Load environment variables for Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME;

// Function to get token from local storage
export const getLocalStorage = (key) => {
    return localStorage.getItem(key);
};

// Function to set token in local storage
export const setLocalStorage = (key, value) => {
    localStorage.setItem(key, value);
};

// Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token in Authorization header
api.interceptors.request.use(
    (config) => {
        const token = getLocalStorage(APP_NAME);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
