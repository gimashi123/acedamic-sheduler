import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TestIcon from '@mui/icons-material/Send';
import settingsService from '../services/settings.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    password: '',
    isEnabled: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState({ success: false, message: '' });
  const [isTestResultVisible, setIsTestResultVisible] = useState(false);

  useEffect(() => {
    // Verify user is an admin
    if (!user || user.role !== Role.ADMIN) {
      navigate('/unauthorized');
    }

    // Fetch current email settings
    fetchEmailSettings();
  }, [user, navigate]);

  const fetchEmailSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getEmailSettings();
      setEmailSettings({
        email: response.email || '',
        password: '', // Don't display the actual password for security
        isEnabled: response.isEnabled,
      });
    } catch (err) {
      console.error('Failed to fetch email settings:', err);
      // It's okay if this fails initially as the endpoint might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    setEmailSettings({
      ...emailSettings,
      [name]: name === 'isEnabled' ? checked : value,
    });
  };

  const handleSaveEmailSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Only send the request if email is enabled and we have both email and password
      if (emailSettings.isEnabled && (!emailSettings.email || !emailSettings.password)) {
        setError('Email and password are required when email notifications are enabled');
        setLoading(false);
        return;
      }

      await settingsService.updateEmailSettings(emailSettings);
      setSuccess('Email settings saved successfully');
      
      // Clear password field after successful save for security
      setEmailSettings({
        ...emailSettings,
        password: '',
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err: any) {
      console.error('Failed to save email settings:', err);
      setError(err.message || 'Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: 'Please enter an email address' });
      setIsTestResultVisible(true);
      return;
    }
    
    try {
      setLoading(true);
      setTestResult({ success: false, message: '' });
      
      await settingsService.testEmailSettings(testEmail);
      setTestResult({
        success: true,
        message: 'Test email sent successfully!'
      });
      setIsTestResultVisible(true);
      
      // Close dialog on success
      setTimeout(() => {
        setOpenTestDialog(false);
        // Reset test state after the dialog closes
        setTimeout(() => {
          setTestEmail('');
          setIsTestResultVisible(false);
        }, 300);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to send test email:', err);
      setTestResult({
        success: false,
        message: err.message || 'Failed to send test email',
      });
      setIsTestResultVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configure system-wide settings and preferences
        </Typography>

        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
            >
              <Tab label="Email Configuration" {...a11yProps(0)} icon={<MailOutlineIcon />} iconPosition="start" />
              {/* Add more tabs as needed */}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Email Notification Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure email settings for sending notifications to users
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailSettings.isEnabled}
                      onChange={handleEmailSettingChange}
                      name="isEnabled"
                      color="primary"
                    />
                  }
                  label="Enable Email Notifications"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={emailSettings.email}
                      onChange={handleEmailSettingChange}
                      variant="outlined"
                      disabled={!emailSettings.isEnabled}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      value={emailSettings.password}
                      onChange={handleEmailSettingChange}
                      variant="outlined"
                      disabled={!emailSettings.isEnabled}
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleToggleShowPassword}
                              edge="end"
                              disabled={!emailSettings.isEnabled}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Note: Currently supports Gmail accounts only. For other providers, configuration must be done in the backend.
                </Typography>
                {emailSettings.isEnabled && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Important: For Gmail accounts, you need to use an "App Password" instead of your regular password.
                    <br />
                    <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer">
                      Learn how to create an App Password
                    </a>
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEmailSettings}
                  disabled={loading}
                >
                  Save Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TestIcon />}
                  onClick={() => setOpenTestDialog(true)}
                  disabled={loading || !emailSettings.isEnabled}
                >
                  Test Email
                </Button>
              </CardActions>
            </Card>
            
            <Typography variant="body2" color="text.secondary">
              Email notifications are used for:
              <ul>
                <li>Sending account credentials to approved users</li>
                <li>Notifying users when their registration request is rejected</li>
                <li>Other system notifications</li>
              </ul>
            </Typography>
          </TabPanel>
        </Paper>
      </Box>

      {/* Test Email Dialog */}
      <Dialog
        open={openTestDialog}
        onClose={() => {
          setOpenTestDialog(false);
          setTestEmail('');
          setIsTestResultVisible(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter an email address to send a test notification. This will help verify your email configuration.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="testEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={loading}
          />
          {isTestResultVisible && (
            <Alert 
              severity={testResult.success ? "success" : "error"} 
              sx={{ mt: 2 }}
            >
              {testResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenTestDialog(false);
              setTestEmail('');
              setIsTestResultVisible(false);
            }} 
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTestEmail} 
            color="primary" 
            variant="contained"
            startIcon={<TestIcon />}
            disabled={loading}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings; 