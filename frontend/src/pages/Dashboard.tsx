import React from 'react';
import useAuthStore from '../store/authStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

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