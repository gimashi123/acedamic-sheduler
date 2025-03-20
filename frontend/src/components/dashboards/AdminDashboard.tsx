import React from 'react';
import { Users, Building2, Calendar, Settings, UserPlus, FileText, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, Administrator!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/users" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100 transition-colors">
            <Users className="h-8 w-8 text-indigo-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </Link>

          <Link to="/venues" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors">
            <Building2 className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Venues</h3>
            <p className="text-gray-600">Manage classrooms and facilities</p>
          </Link>

          <Link to="/schedule" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
            <p className="text-gray-600">View and manage class schedules</p>
          </Link>

          <Link to="/requests" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors">
            <UserPlus className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">User Requests</h3>
            <p className="text-gray-600">Review and process user registration requests</p>
          </Link>

          <Link to="/reports" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors">
            <FileText className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            <p className="text-gray-600">Generate and view system reports</p>
          </Link>

          <Link to="/analytics" className="bg-red-50 p-6 rounded-lg hover:bg-red-100 transition-colors">
            <BarChart className="h-8 w-8 text-red-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            <p className="text-gray-600">View system usage and performance metrics</p>
          </Link>

          <Link to="/settings" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-8 w-8 text-gray-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            <p className="text-gray-600">Configure system-wide settings</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent User Requests</h3>
          <div className="space-y-4">
            {/* Placeholder for recent user requests */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <p className="text-gray-600">No pending user requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            {/* Placeholder for system status */}
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 