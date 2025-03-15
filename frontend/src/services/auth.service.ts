import api from './api';
import { AuthResponse, LoginCredentials, ApiResponse, User } from '../types';

interface ExtendedAuthResponse extends AuthResponse {
  passwordChangeRequired?: boolean;
  defaultPassword?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ExtendedAuthResponse> {
    try {
      const response = await api.post<ApiResponse<ExtendedAuthResponse>>('/auth/login', credentials);
      if (response.data.success) {
        this.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
        
        // Store the passwordChangeRequired flag and defaultPassword in the user object
        const userData = {
          ...response.data.data.user,
          passwordChangeRequired: response.data.data.passwordChangeRequired,
          defaultPassword: response.data.data.defaultPassword
        };
        
        this.setUser(userData);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
      
      // Update the user object to remove the passwordChangeRequired flag
      const user = this.getCurrentUser();
      if (user) {
        user.passwordChangeRequired = false;
        user.defaultPassword = undefined;
        this.setUser(user);
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to change password');
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default new AuthService(); 