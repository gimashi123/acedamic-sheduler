import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { requestApi, userApi } from '../services/api';
import { UserRequest, User } from '../types';
import { Link } from 'react-router-dom';
import { UserPlus, Users, Settings, Clock, RefreshCw } from 'lucide-react';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Loading fallback component
const Loading = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Dashboard fallback in case of error
const DashboardFallback = () => (
  <div className="space-y-8">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    
    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
      <h2 className="font-bold text-lg">Dashboard Error</h2>
      <p>There was a problem loading the dashboard. Please try refreshing the page.</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Refresh Page
      </button>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-6">
      <p>
        You can also navigate to specific sections using the sidebar menu.
      </p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPendingRequests: 0
  });
  const [initialized, setInitialized] = useState(false);

  // Safe version of fetchDashboardData that won't crash the UI
  const fetchDashboardData = useCallback(async () => {
    if (isLoading) return; // Prevent multiple concurrent fetches
    
    try {
      setIsLoading(true);
      setError('');
      let hasError = false;

      // Fetch pending requests
      try {
        const requests = await requestApi.getRequestsByStatus('Pending');
        
        // Safely update state only if component is still mounted
        setPendingRequests(requests || []);
        setStats(prev => ({
          ...prev,
          totalPendingRequests: requests ? requests.length : 0
        }));
      } catch (requestErr) {
        console.error('Error fetching pending requests:', requestErr);
        // Don't set error here to avoid blocking the UI
        hasError = true;
      }

      // Fetch user stats
      try {
        const users = await userApi.getAllUsers();
        
        // Safely update state
        setStats(prev => ({
          ...prev,
          totalUsers: users ? users.length : 0
        }));
      } catch (userErr) {
        console.error('Error fetching users:', userErr);
        // Only set error if we don't already have one from requests
        if (!hasError) {
          setError('Unable to load user statistics');
        }
      }

      // Mark as initialized even if there were errors
      setInitialized(true);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to fetch dashboard data');
      // Still mark as initialized to show the UI
      setInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // Only depend on isLoading to prevent multiple fetches

  // Fetch on initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Approve the request
      await requestApi.approveRequest(requestId);
      
      // Update the local state
      setPendingRequests((prev: UserRequest[]) => prev.filter((req: UserRequest) => req._id !== requestId));
      setStats(prev => ({
        ...prev,
        totalPendingRequests: Math.max(0, prev.totalPendingRequests - 1),
        totalUsers: prev.totalUsers + 1
      }));
      
      // Show success message
      alert('Request approved successfully');
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      setError('');
      
      // Reject the request with reason
      await requestApi.rejectRequest(selectedRequestId, rejectReason);
      
      // Update the local state
      setPendingRequests((prev: UserRequest[]) => prev.filter((req: UserRequest) => req._id !== selectedRequestId));
      setStats(prev => ({
        ...prev,
        totalPendingRequests: Math.max(0, prev.totalPendingRequests - 1)
      }));
      
      // Show success message
      alert('Request rejected successfully');
      
      // Close the modal
      closeRejectModal();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the case where initialization is still in progress
  if (!initialized && isLoading) {
    return <Loading />;
  }

  // Main dashboard render
  return (
    <ErrorBoundary fallback={<DashboardFallback />}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => fetchDashboardData()} 
            disabled={isLoading}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        {error && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>{error} - Some dashboard features may be limited</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
              <Link to="/users" className="text-indigo-600 text-sm hover:underline mt-1 inline-block">
                View all users
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Pending Requests</h2>
              <p className="text-2xl font-semibold">{stats.totalPendingRequests}</p>
              <Link to="/requests" className="text-amber-600 text-sm hover:underline mt-1 inline-block">
                Manage requests
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
            <div className="bg-emerald-100 p-3 rounded-lg mr-4">
              <Settings className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">System Settings</h2>
              <p className="text-2xl font-semibold">Configuration</p>
              <Link to="/settings" className="text-emerald-600 text-sm hover:underline mt-1 inline-block">
                Manage settings
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Registration Requests */}
        <Suspense fallback={<Loading />}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Recent Registration Requests</h2>
              </div>
              <Link 
                to="/requests" 
                className="text-indigo-600 text-sm hover:underline"
              >
                View all requests
              </Link>
            </div>

            {isLoading && pendingRequests.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending requests found
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request: UserRequest) => (
                  <div key={request._id} className="border p-4 rounded-md">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <p className="font-medium">{request.firstName} {request.lastName}</p>
                        <p className="text-sm text-gray-600">{request.email}</p>
                        <p className="text-sm text-gray-600">Role: {request.role}</p>
                        {request.additionalDetails && (
                          <p className="text-sm text-gray-600 mt-2">
                            Additional Details: {request.additionalDetails}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                          disabled={isLoading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(request._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          disabled={isLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length > 3 && (
                  <div className="text-center py-2">
                    <Link 
                      to="/requests" 
                      className="text-indigo-600 hover:underline"
                    >
                      View {pendingRequests.length - 3} more pending requests
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Suspense>

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
                  disabled={isLoading}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 