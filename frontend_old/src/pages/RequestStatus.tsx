import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRequest } from '../context/RequestContext';
import { RequestStatus } from '../types';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Stack,
  Fade,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EmailIcon from '@mui/icons-material/Email';

const RequestStatusPage: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { getRequestStatus, loading, error, clearError } = useRequest();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if email was passed from registration page
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      checkStatus(location.state.email);
    } else {
      setShowForm(true);
    }
  }, [location.state]);

  const checkStatus = async (emailToCheck: string) => {
    try {
      clearError();
      setFormError('');
      const result = await getRequestStatus(emailToCheck);
      setStatus(result.status);
      setCreatedAt(result.createdAt);
      setShowForm(false);
    } catch (err: any) {
      console.error('Error checking request status:', err);
      setStatus(null);
      setCreatedAt(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setFormError('Email is required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    await checkStatus(email);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return theme.palette.success.main;
      case RequestStatus.REJECTED:
        return theme.palette.error.main;
      case RequestStatus.PENDING:
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusBgColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return alpha(theme.palette.success.main, 0.1);
      case RequestStatus.REJECTED:
        return alpha(theme.palette.error.main, 0.1);
      case RequestStatus.PENDING:
      default:
        return alpha(theme.palette.warning.main, 0.1);
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return <CheckCircleOutlineIcon color="success" fontSize="large" />;
      case RequestStatus.REJECTED:
        return <ErrorOutlineIcon color="error" fontSize="large" />;
      case RequestStatus.PENDING:
      default:
        return <HourglassEmptyIcon color="warning" fontSize="large" />;
    }
  };

  const getStatusMessage = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return 'Your registration request has been approved! You can now log in with the credentials sent to your email.';
      case RequestStatus.REJECTED:
        return 'Your registration request has been rejected. Please contact the administrator for more information.';
      case RequestStatus.PENDING:
      default:
        return 'Your registration request is pending approval. Please check back later or contact the administrator for more information.';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            padding: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
            Registration Request Status
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {showForm ? (
            <Fade in={showForm}>
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body1" paragraph align="center" sx={{ mb: 3 }}>
                  Enter your email address to check the status of your registration request.
                </Typography>
                
                {formError && (
                  <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                    {formError}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      py: 1.5,
                      fontWeight: 'medium',
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Check Status'}
                  </Button>
                </Box>
              </Box>
            </Fade>
          ) : (
            <Fade in={!showForm}>
              <Box sx={{ width: '100%', mt: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                    <CircularProgress />
                  </Box>
                ) : status ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 4, 
                        mb: 4, 
                        backgroundColor: getStatusBgColor(status),
                        borderRadius: 2,
                      }}
                    >
                      {getStatusIcon(status)}
                      <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                          mt: 2, 
                          fontWeight: 'medium',
                          color: getStatusColor(status)
                        }}
                      >
                        {status}
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ mt: 1 }}>
                        {getStatusMessage(status)}
                      </Typography>
                    </Box>
                    
                    <Card variant="outlined" sx={{ mb: 4 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                          Request Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {email}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary">
                              Status
                            </Typography>
                            <Typography 
                              variant="body1" 
                              gutterBottom
                              sx={{ color: getStatusColor(status) }}
                            >
                              {status}
                            </Typography>
                          </Grid>
                          
                          {createdAt && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="caption" color="text.secondary">
                                Submitted on
                              </Typography>
                              <Typography variant="body1" gutterBottom>
                                {formatDate(createdAt)}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                    
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2} 
                      justifyContent="center"
                      sx={{ mt: 2 }}
                    >
                      {status === RequestStatus.APPROVED && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate('/login')}
                          sx={{ fontWeight: 'medium' }}
                        >
                          Go to Login
                        </Button>
                      )}
                      
                      <Button
                        variant={status === RequestStatus.APPROVED ? "outlined" : "contained"}
                        color="primary"
                        onClick={() => {
                          setShowForm(true);
                          setStatus(null);
                          setCreatedAt(null);
                        }}
                        sx={{ fontWeight: 'medium' }}
                      >
                        Check Another Email
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate('/')}
                        sx={{ fontWeight: 'medium' }}
                      >
                        Back to Home
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ my: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      <AccessTimeIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No Request Found
                      </Typography>
                    </Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      No registration request found for this email. Please make sure you've entered the correct email address.
                    </Alert>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowForm(true);
                        setEmail('');
                      }}
                      sx={{ fontWeight: 'medium' }}
                    >
                      Try Again
                    </Button>
                  </Box>
                )}
              </Box>
            </Fade>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default RequestStatusPage; 