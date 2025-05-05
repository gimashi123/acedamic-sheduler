import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { setTheme } from '../../store/themeSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Card, 
  CardContent, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Box, 
  Paper, 
  Grid,
  Button
} from '@mui/material';
import { DarkMode, LightMode, Settings as SettingsIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, setMode, toggleMode, isDark } = useTheme();
  
  const handleThemeChange = () => {
    toggleMode();
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <SettingsIcon 
          fontSize="large" 
          className="mr-2" 
          style={{ color: 'var(--color-accent)' }} 
        />
        <h1 className="text-2xl font-bold">Application Settings</h1>
      </div>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            className="overflow-hidden transition-shadow hover:shadow-lg"
            sx={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Box sx={{ 
              backgroundColor: 'var(--color-accent)',
              padding: 2
            }}>
              <Typography variant="h6" className="text-white font-bold">
                Appearance Settings
              </Typography>
            </Box>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <Typography variant="body1" className="mb-4" sx={{ color: 'var(--color-text-secondary)' }}>
                  Choose between light and dark mode for your interface.
                </Typography>
                
                <div className="flex flex-col space-y-4">
                  <div 
                    className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all`}
                    style={{
                      borderColor: mode === 'light' ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: mode === 'light' ? (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)') : 'transparent'
                    }}
                    onClick={() => setMode('light')}
                  >
                    <div className="flex items-center">
                      <LightMode className="text-yellow-500 mr-3" />
                      <div>
                        <Typography variant="body1" className="font-medium">Light Mode</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Bright interface for daytime use
                        </Typography>
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {mode === 'light' && (
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all`}
                    style={{
                      borderColor: mode === 'dark' ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                    }}
                    onClick={() => setMode('dark')}
                  >
                    <div className="flex items-center">
                      <DarkMode className="text-indigo-400 mr-3" />
                      <div>
                        <Typography variant="body1" className="font-medium">Dark Mode</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Darker interface to reduce eye strain
                        </Typography>
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {mode === 'dark' && (
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider className="my-6" />
              
              <div>
                <Typography variant="subtitle1" className="font-medium mb-2">
                  Quick Toggle
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={handleThemeChange}
                      color="primary"
                    />
                  }
                  label={
                    <div className="flex items-center">
                      {mode === 'dark' ? <DarkMode className="mr-2" /> : <LightMode className="mr-2" />}
                      <span>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Paper>
        </Grid>
        
        {/* Additional settings panels can be added here */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            className="overflow-hidden transition-shadow hover:shadow-lg"
            sx={{
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)'
            }}
          >
            <Box sx={{ 
              backgroundColor: 'var(--color-accent)',
              padding: 2
            }}>
              <Typography variant="h6" className="text-white font-bold">
                System Information
              </Typography>
            </Box>
            
            <CardContent className="p-6">
              <Typography variant="body1" className="mb-4" sx={{ color: 'var(--color-text-secondary)' }}>
                System details and information.
              </Typography>
              
              <div className="space-y-2">
                <div className="flex justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Application Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Last Updated</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Environment</span>
                  <span className="font-medium">Production</span>
                </div>
              </div>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings; 