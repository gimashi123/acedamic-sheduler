import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ThemeProvider as MuiThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  
  // Create theme based on current mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode === 'dark' ? 'dark' : 'light',
          primary: {
            main: '#4f46e5', // indigo-600
            light: '#6366f1', // indigo-500
            dark: '#4338ca', // indigo-700
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c3aed', // violet-600
            light: '#8b5cf6', // violet-500
            dark: '#6d28d9', // violet-700
          },
          background: {
            default: themeMode === 'dark' ? '#111827' : '#f9fafb',
            paper: themeMode === 'dark' ? '#1f2937' : '#ffffff',
          },
          text: {
            primary: themeMode === 'dark' ? '#f3f4f6' : '#111827',
            secondary: themeMode === 'dark' ? '#9ca3af' : '#4b5563',
          },
          error: {
            main: '#ef4444',
          },
          warning: {
            main: '#f59e0b',
          },
          info: {
            main: '#3b82f6',
          },
          success: {
            main: '#10b981',
          },
          divider: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: themeMode === 'dark' ? '#6B7280 #1F2937' : '#9CA3AF #F3F4F6',
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  backgroundColor: themeMode === 'dark' ? '#1F2937' : '#F3F4F6',
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: 8,
                  backgroundColor: themeMode === 'dark' ? '#6B7280' : '#9CA3AF',
                  minHeight: 24,
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                backgroundColor: themeMode === 'dark' ? '#1f2937' : '#ffffff',
              },
            },
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          button: {
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [themeMode],
  );

  // Apply dark mode class to document
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider; 