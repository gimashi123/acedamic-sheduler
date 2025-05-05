import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import App from './App.tsx';
import './index.css';

// Initialize theme from localStorage if available
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no saved preference, check system preference
    document.documentElement.classList.add('dark');
  }
};

// Initialize theme early to prevent flash of wrong theme
initializeTheme();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-gray-100',
            style: {
              background: 'var(--toaster-bg, #fff)',
              color: 'var(--toaster-text, #111)',
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
