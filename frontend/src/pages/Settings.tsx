import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, Send } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

interface EmailSettings {
  provider: string;
  from: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

const Settings: React.FC = () => {
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmailSettings();
    }
  }, [user]);

  const fetchEmailSettings = async () => {
    try {
      const response = await api.get('/settings/email');
      setEmailSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings/email', emailSettings);
      setSuccessMessage('Email settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update email settings');
    }
  };

  const handleTestEmail = async () => {
    try {
      await api.post('/settings/test-email');
      setSuccessMessage('Test email sent successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to send test email');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
        You don't have permission to view this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-500 p-4 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-medium text-gray-900">Email Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Provider
            </label>
            <select
              value={emailSettings?.provider}
              onChange={(e) => setEmailSettings({ ...emailSettings!, provider: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="gmail">Gmail</option>
              <option value="smtp">SMTP</option>
              <option value="sendgrid">SendGrid</option>
              <option value="console">Console (Debug)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Email
            </label>
            <input
              type="email"
              value={emailSettings?.from}
              onChange={(e) => setEmailSettings({ ...emailSettings!, from: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {emailSettings?.provider === 'smtp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={emailSettings.host}
                  onChange={(e) => setEmailSettings({ ...emailSettings, host: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={emailSettings.port}
                  onChange={(e) => setEmailSettings({ ...emailSettings, port: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleTestEmail}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Test Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;