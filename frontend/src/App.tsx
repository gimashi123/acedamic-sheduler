import { useEffect, useState } from 'react';
import AppRouter from './router';
import useAuthStore from './store/authStore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { setTheme } from './store/themeSlice';
import ThemeProvider from './components/ThemeProvider';
import { ThemeContextProvider } from './contexts/ThemeContext';

function App() {
  const { checkAuth } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  return (
    <ThemeContextProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </ThemeContextProvider>
  );
}

export default App;