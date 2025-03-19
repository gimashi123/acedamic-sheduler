import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { authApi, requestApi } from '../services/api';
import { UserRole } from '../types';
import axios from 'axios';

const RegisterRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student' as UserRole,
    additionalDetails: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Submitting registration request:', formData);
      
      // Use the API service
      const response = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        additionalDetails: formData.additionalDetails
      });
      
      console.log('Response:', response);
      
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Student',
        additionalDetails: ''
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      // Get more detailed error message from response if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit registration request';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusEmail) {
      setError('Please enter an email address');
      return;
    }
    
    setIsCheckingStatus(true);
    setError('');
    setRequestStatus(null);
    
    try {
      const response = await requestApi.checkRequestStatus(statusEmail);
      setRequestStatus(response.status);
    } catch (err) {
      setError('Failed to fetch request status. The email may not be registered.');
      setRequestStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">Request Registration</h2>
      </div>

      {success ? (
        <div className="bg-green-50 text-green-600 text-center py-4 rounded-md">
          <p className="font-medium">Registration request submitted successfully!</p>
          <p className="mt-2 text-sm">Please wait for admin approval. You can check your request status below.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              required
              disabled={isLoading}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              required
              disabled={isLoading}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              disabled={isLoading}
            >
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Additional Details
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Check Request Status</h3>
        <form onSubmit={checkStatus} className="flex flex-col space-y-4">
          <div>
            <input
              type="email"
              value={statusEmail}
              onChange={(e) => setStatusEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              disabled={isCheckingStatus}
            />
          </div>
          
          <button
            type="submit"
            className={`bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 ${
              isCheckingStatus ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {requestStatus && (
          <div className={`mt-4 p-3 rounded-md ${
            requestStatus === 'Approved' 
              ? 'bg-green-50 text-green-700' 
              : requestStatus === 'Rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
          }`}>
            <p className="font-medium">Request Status: {requestStatus}</p>
            {requestStatus === 'Approved' && (
              <p className="text-sm mt-1">
                Your request has been approved. Please check your email for login credentials.
              </p>
            )}
            {requestStatus === 'Pending' && (
              <p className="text-sm mt-1">
                Your request is still pending. Please check back later.
              </p>
            )}
            {requestStatus === 'Rejected' && (
              <p className="text-sm mt-1">
                Your request has been rejected. You may submit a new request with additional details.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterRequestForm;