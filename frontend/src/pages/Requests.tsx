import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { requestApi } from '../services/api';
import { UserRequest } from '../types';
import useAuthStore from '../store/authStore';

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const pendingRequests = await requestApi.getRequestsByStatus('Pending');
      setRequests(pendingRequests);
      setError(null);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await requestApi.approveRequest(requestId);
      // Remove the approved request from the list
      setRequests(prev => prev.filter(req => req._id !== requestId));
      alert('Request approved successfully');
    } catch (err) {
      setError('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequestId(null);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequestId) return;

    try {
      setLoading(true);
      await requestApi.rejectRequest(selectedRequestId, rejectReason);
      // Remove the rejected request from the list
      setRequests(prev => prev.filter(req => req._id !== selectedRequestId));
      alert('Request rejected successfully');
      closeRejectModal();
    } catch (err) {
      setError('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
        You don't have permission to view this page.
      </div>
    );
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        <h1 className="text-2xl font-semibold text-gray-900">Registration Requests</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending requests found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.firstName} {request.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openRejectModal(request._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reject Request</h3>
            <p className="mb-4">Please provide a reason for rejecting this request:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
              placeholder="Enter reason for rejection"
            />
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={loading}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;