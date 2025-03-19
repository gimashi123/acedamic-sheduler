import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import api from '../services/api';
import { UserRole } from '../types';

const RegisterRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as UserRole,
    additionalDetails: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/request/submit', formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        additionalDetails: ''
      });
    } catch (err) {
      setError('Failed to submit registration request');
    }
  };

  const checkStatus = async () => {
    try {
      const response = await api.get(`/request/status/${statusEmail}`);
      setRequestStatus(response.data.status);
      setError('');
    } catch (err) {
      setError('Failed to fetch request status');
      setRequestStatus(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">Request Registration</h2>
      </div>

      {success ? (
        <div className="text-green-600 text-center py-4">
          Registration request submitted successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Details
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Submit Request
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Check Request Status</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={statusEmail}
            onChange={(e) => setStatusEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={checkStatus}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Check
          </button>
        </div>
        {requestStatus && (
          <div className="mt-2 text-center">
            <span className={`px-2 py-1 text-sm font-semibold rounded-full
              ${requestStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                requestStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'}`}>
              {requestStatus}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterRequestForm;