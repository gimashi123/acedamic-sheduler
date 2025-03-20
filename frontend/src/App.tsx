import { useEffect, useState } from 'react';
import AppRouter from './router';
import useAuthStore from './store/authStore';

function App() {
  const { checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsCheckingAuth(false);
    };
    
    initializeAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;