import React, { useState } from 'react';
import {
  UserPlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info,
} from 'lucide-react';
import { UserRole } from '@/data-types/user.tp.ts';
import { authApi, requestApi } from '@/services/auth.service.ts';

const RegisterRequestForm: React.FC = () => {
  const steps = ['Personal Info', 'Role & Details', 'Review'];
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Student' as UserRole,
    additionalDetails: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2:
        return !!formData.role;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setError('');
    setIsLoading(true);

    try {
      await authApi.register(formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Student',
        additionalDetails: '',
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="md:w-1/2  hidden md:flex items-center justify-center">
            <img
              src={'/bg-images/register-img.jpg'}
              alt="Registration"
              className="object-cover h-full "
            />
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <UserPlus className="h-8 w-8 text-indigo-600" />
                Request Registration
              </h2>

              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex justify-center">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          currentStep > index + 1
                            ? 'bg-indigo-600'
                            : 'bg-gray-200'
                        } ${currentStep === index + 1 ? 'border-2 border-indigo-600' : ''}`}
                      >
                        {currentStep > index + 1 ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              currentStep === index + 1
                                ? 'text-indigo-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-1 transition-colors ${
                            currentStep > index + 1
                              ? 'bg-indigo-600'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
                </div>
              </div>
            </div>

            {success ? (
              <div className="bg-green-50 p-4 rounded-md mb-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-medium">
                    Request Submitted Successfully!
                  </h3>
                </div>
                <p className="mt-2 text-sm">
                  Your request is under review. We'll notify you via email once
                  approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
                    <Info className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1 - Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2 - Role & Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Student">Student</option>
                        <option value="Lecturer">Lecturer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Student ID, department, or other relevant information"
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3 - Review */}
                {currentStep === 3 && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-600">First Name:</div>
                      <div className="font-medium">{formData.firstName}</div>

                      <div className="text-gray-600">Last Name:</div>
                      <div className="font-medium">{formData.lastName}</div>

                      <div className="text-gray-600">Email:</div>
                      <div className="font-medium">{formData.email}</div>

                      <div className="text-gray-600">Role:</div>
                      <div className="font-medium">{formData.role}</div>
                    </div>

                    {formData.additionalDetails && (
                      <>
                        <div className="text-gray-600">Additional Details:</div>
                        <p className="text-sm">{formData.additionalDetails}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="flex justify-between">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>
                  )}

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="ml-auto flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70 transition-colors"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Status Check Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Check Request Status
              </h3>

              <form onSubmit={handleCheckStatus} className="max-w-md">
                <div className="space-y-3">
                  <input
                    type="email"
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isCheckingStatus}
                    className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:opacity-70 transition-colors"
                  >
                    {isCheckingStatus ? 'Checking...' : 'Check Status'}
                  </button>

                  {requestStatus && (
                    <div
                      className={`p-3 rounded-md ${
                        requestStatus === 'Approved'
                          ? 'bg-green-50 text-green-700'
                          : requestStatus === 'Rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        <span>
                          Status: <strong>{requestStatus}</strong>
                          {requestStatus === 'Approved' &&
                            ' - Check your email for login details'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRequestForm;
