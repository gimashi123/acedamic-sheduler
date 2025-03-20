import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { UserRole } from '../../types';
import { authApi, requestApi } from '../../utils/api';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await authApi.register(formData);
      setSuccess(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Student',
        additionalDetails: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check request status
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusEmail) {
      setError('Please enter your email address');
      return;
    }
    
    setIsCheckingStatus(true);
    try {
      const response = await requestApi.checkRequestStatus(statusEmail);
      setRequestStatus(response.status);
      setError('');
    } catch (error: any) {
      setRequestStatus(null);
      setError('Could not find any request with this email');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <UserPlus className="mr-2 h-6 w-6 text-indigo-600" />
        Request Registration
      </h2>

      {success ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          <p className="font-medium">Registration request submitted successfully!</p>
          <p className="mt-2">
            Your request has been submitted for review. You will be notified by email when your account is approved.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details
            </label>
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              rows={4}
              value={formData.additionalDetails}
              onChange={handleChange}
              placeholder="Please provide any additional information that might be helpful for your registration (e.g., student ID, department, course information)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Registration Request'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Check Request Status</h3>
        
        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div>
            <label htmlFor="statusEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email Address
            </label>
            <input
              id="statusEmail"
              type="email"
              value={statusEmail}
              onChange={(e) => setStatusEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isCheckingStatus}
            className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
              isCheckingStatus ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isCheckingStatus ? 'Checking...' : 'Check Status'}
          </button>
          
          {requestStatus && (
            <div className={`mt-3 p-3 rounded-md ${
              requestStatus === 'Approved' 
                ? 'bg-green-50 text-green-700' 
                : requestStatus === 'Rejected'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              Your registration request is <strong>{requestStatus}</strong>
              {requestStatus === 'Approved' && (
                <p className="mt-1 text-sm">You can now log in with the credentials sent to your email.</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterRequestForm;
