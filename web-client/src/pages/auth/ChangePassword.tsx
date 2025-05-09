import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/auth/auth-context.tsx';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal.tsx';

const ChangePassword: React.FC = () => {
  // const { isAuthenticated, passwordChangeRequired } = useAuth();
  const navigate = useNavigate();

  // console.log(isAuthenticated, passwordChangeRequired);

  // useEffect(() => {
  //   if (isAuthenticated && !passwordChangeRequired) {
  //     navigate('/', { replace: true });
  //   }

  //   // If user is not authenticated, redirect to login
  //   if (!isAuthenticated) {
  //     navigate('/login', { replace: true });
  //   }
  // }, [isAuthenticated, passwordChangeRequired, navigate]);

  // Only render the change password modal if user is authenticated and requires password change
  return (
    <div className="min-h-screen bg-gray-50">
      {/* {isAuthenticated && passwordChangeRequired && ( */}
      <ChangePasswordModal
        isOpen={true}
        onClose={() => navigate('/')}
        isFirstLogin={true}
      />
      {/* )} */}
    </div>
  );
};

export default ChangePassword;
