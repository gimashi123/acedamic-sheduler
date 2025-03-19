import api from './api';
import { ApiResponse } from '../types';

interface EmailSettings {
  email: string;
  password?: string;
  isEnabled: boolean;
}

class SettingsService {
  async getEmailSettings(): Promise<EmailSettings> {
    try {
      const response = await api.get<ApiResponse<EmailSettings>>('/settings/email');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to get email settings');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to get email settings');
      }
      throw error;
    }
  }

  async updateEmailSettings(settings: EmailSettings): Promise<{ isEnabled: boolean }> {
    try {
      const response = await api.post<ApiResponse<{ isEnabled: boolean }>>('/settings/email', settings);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update email settings');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update email settings');
      }
      throw error;
    }
  }

  async testEmailSettings(testEmail: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse<{}>>('/settings/email/test', { testEmail });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send test email');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to send test email');
      }
      throw error;
    }
  }
}

export default new SettingsService(); 