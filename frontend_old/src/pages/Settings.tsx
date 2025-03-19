import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';
import { Role } from '../types';

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
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailService, setEmailService] = useState('gmail');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // State for API operations
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    provider?: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== Role.ADMIN) {
      navigate('/unauthorized');
      return;
    }

    // Load settings
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/email');
      if (response.data.success) {
        const settings = response.data.data;
        setEmailEnabled(settings.isEnabled || false);
        setEmailService(settings.service || 'gmail');
        setEmailAddress(settings.email || '');
        // Password is not returned for security reasons
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveEmailSettings = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await api.post('/settings/email', {
        isEnabled: emailEnabled,
        service: emailService,
        email: emailAddress,
        password: emailPassword || undefined, // Only send if changed
      });

      if (response.data.success) {
        setSuccess('Email settings saved successfully');
        // Clear password field after save
        setEmailPassword('');
        
        // Reload settings to get the latest
        await loadSettings();
      } else {
        setError(response.data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      setError('Please enter a test email address');
      return;
    }

    try {
      setTestEmailLoading(true);
      setTestEmailResult(null);
      setError('');

      const response = await api.post('/settings/test-email', {
        to: testEmailAddress,
      });

      setTestEmailResult(response.data.data);
    } catch (err: any) {
      console.error('Error sending test email:', err);
      setError(err.response?.data?.message || 'Failed to send test email');
      setTestEmailResult({
        success: false,
        message: err.response?.data?.message || 'Failed to send test email',
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (!user || user.role !== Role.ADMIN) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configure system settings and preferences
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
            >
              <Tab label="Email Settings" {...a11yProps(0)} />
              <Tab label="General Settings" {...a11yProps(1)} disabled />
              <Tab label="User Defaults" {...a11yProps(2)} disabled />
            </Tabs>
          </Box>

          {/* Email Settings Tab */}
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailEnabled}
                        onChange={(e) => setEmailEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    When enabled, the system will send email notifications for account approvals, rejections, and other important events.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Email Provider Configuration
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={!emailEnabled}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Password"
                    type={showPassword ? 'text' : 'password'}
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    disabled={!emailEnabled}
                    variant="outlined"
                    margin="normal"
                    placeholder="Enter new password to change"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={!emailEnabled}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveEmailSettings}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Save Email Settings
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Test Email Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Send a test email to verify your configuration is working correctly.
                  </Typography>

                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Test Email Address"
                            value={testEmailAddress}
                            onChange={(e) => setTestEmailAddress(e.target.value)}
                            disabled={!emailEnabled || testEmailLoading}
                            variant="outlined"
                            placeholder="Enter email address to send test to"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<SendIcon />}
                            onClick={handleSendTestEmail}
                            disabled={!emailEnabled || !testEmailAddress || testEmailLoading}
                          >
                            {testEmailLoading ? (
                              <CircularProgress size={24} />
                            ) : (
                              'Send Test Email'
                            )}
                          </Button>
                        </Grid>

                        {testEmailResult && (
                          <Grid item xs={12}>
                            <Alert
                              severity={testEmailResult.success ? 'success' : 'error'}
                              sx={{ mt: 2 }}
                            >
                              {testEmailResult.success
                                ? `Test email sent successfully using provider: ${testEmailResult.provider}`
                                : `Failed to send test email: ${testEmailResult.message}`}
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Other tabs would go here */}
          <TabPanel value={tabValue} index={1}>
            <Typography>General Settings (Coming Soon)</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography>User Defaults (Coming Soon)</Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 