import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../components/ChangePasswordModal';
import useAuthStore from '../store/authStore';

const ChangePassword: React.FC = () => {
  const { user, isAuthenticated, passwordChangeRequired } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated but doesn't need to change password, redirect to dashboard
    if (isAuthenticated && !passwordChangeRequired) {
      navigate('/', { replace: true });
    }
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, passwordChangeRequired, navigate]);

  // Only render the change password modal if user is authenticated and requires password change
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && passwordChangeRequired && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => navigate('/')}
          isFirstLogin={true}
        />
      )}
    </div>
  );
};

export default ChangePassword; 