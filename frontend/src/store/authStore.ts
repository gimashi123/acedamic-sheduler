import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordChangeRequired: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setPasswordChangeRequired: (required: boolean) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  passwordChangeRequired: false,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    passwordChangeRequired: false
  }),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await authApi.login(email, password);
      localStorage.setItem('accessToken', authResponse.accessToken);
      localStorage.setItem('refreshToken', authResponse.refreshToken);
      
      set({ 
        user: authResponse.user, 
        isAuthenticated: true,
        passwordChangeRequired: false,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ 
      user: null, 
      isAuthenticated: false, 
      passwordChangeRequired: false,
      error: null 
    });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    set({ isLoading: true });
    try {
      const user = await authApi.checkTokenValidity();
      set({ 
        user, 
        isAuthenticated: true,
        passwordChangeRequired: false,
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  },
  
  setPasswordChangeRequired: (required) => set({ passwordChangeRequired: required }),
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;