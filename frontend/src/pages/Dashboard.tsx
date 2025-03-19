import React, { Suspense, lazy } from 'react';
import useAuthStore from '../store/authStore';

// Lazy load AdminDashboard to prevent rendering errors from affecting the main dashboard
const AdminDashboard = lazy(() => import('./AdminDashboard'));

// Create a simple error boundary for the Dashboard
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

// Loading component
const LoadingDashboard = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Error fallback in case AdminDashboard fails to load
const AdminDashboardErrorFallback = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h1 className="text-2xl font-semibold text-gray-900 mb-4">
      Admin Dashboard
    </h1>
    <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
      <h2 className="font-semibold">Error Loading Dashboard</h2>
      <p>There was a problem loading the admin dashboard. Please try refreshing the page.</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  // If user is an admin, render the AdminDashboard with error handling
  if (user?.role === 'Admin') {
    return (
      <ErrorBoundary fallback={<AdminDashboardErrorFallback />}>
        <Suspense fallback={<LoadingDashboard />}>
          <AdminDashboard />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Otherwise render the standard dashboard
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Welcome, {user?.firstName}!
      </h1>
      <p className="text-gray-600">
        This is your dashboard. More features will be added here soon.
      </p>
    </div>
  );
};

export default Dashboard;