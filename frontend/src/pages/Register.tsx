import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRequest } from '../context/RequestContext';
import { Role } from '../types';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  Fade,
  alpha,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import HowToRegIcon from '@mui/icons-material/HowToReg';

const Register: React.FC = () => {
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { submitRequest, loading, error, clearError } = useRequest();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    setSuccess(false);

    // Validate form
    if (!firstName || !lastName || !email) {
      setFormError('First name, last name, and email are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await submitRequest({ firstName, lastName, email, role, additionalDetails });
      setSuccess(true);
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setAdditionalDetails('');
      setRole(Role.STUDENT);
      
      // Redirect to status page after 3 seconds
      setTimeout(() => {
        navigate('/request-status', { state: { email } });
      }, 3000);
    } catch (err: any) {
      console.error('Registration request error:', err);
      // Error is already set in the request context
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
            padding: { xs: 3, md: 4 },
            borderRadius: 2,
            width: '100%',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={5} sx={{ 
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              p: 3
            }}>
              <HowToRegIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 'medium' }}>
                Join Our Academic Community
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Request an account to access the Academic Scheduler system. Your request will be reviewed by an administrator.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Chip 
                  label="Students" 
                  icon={<SchoolIcon />} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ m: 0.5 }} 
                />
                <Chip 
                  label="Lecturers" 
                  icon={<PersonIcon />} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ m: 0.5 }} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box sx={{ px: { xs: 0, md: 2 } }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Registration Request
                </Typography>
                
                <Typography 
                  variant="body1" 
                  paragraph 
                  align="center" 
                  sx={{ 
                    mb: 3,
                    display: { xs: 'block', md: 'none' }
                  }}
                >
                  Please fill out this form to request an account. Your request will be reviewed by an administrator.
                </Typography>
                
                <Fade in={success}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      display: success ? 'flex' : 'none',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">Request submitted successfully!</Typography>
                      <Typography variant="body2">
                        You will be redirected to the status page in a moment.
                      </Typography>
                    </Box>
                  </Alert>
                </Fade>
                
                {(error || formError) && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {formError || error}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        autoFocus
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading || success}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading || success}
                        variant="outlined"
                      />
                    </Grid>
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
                        disabled={loading || success}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                          labelId="role-label"
                          id="role"
                          value={role}
                          label="Role"
                          onChange={(e) => setRole(e.target.value as Role)}
                          disabled={loading || success}
                          startAdornment={<SchoolIcon color="action" sx={{ mr: 1, ml: -0.5 }} />}
                        >
                          <MenuItem value={Role.STUDENT}>Student</MenuItem>
                          <MenuItem value={Role.LECTURER}>Lecturer</MenuItem>
                        </Select>
                        <FormHelperText>Select your role in the system</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="additionalDetails"
                        label="Additional Details"
                        name="additionalDetails"
                        multiline
                        rows={4}
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        disabled={loading || success}
                        variant="outlined"
                        helperText="Please provide any additional information that might be relevant to your request (optional)"
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
                      fontWeight: 'medium'
                    }}
                    disabled={loading || success}
                    startIcon={loading ? undefined : <HowToRegIcon />}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                  </Button>
                  
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Or" />
                  </Divider>
                  
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    justifyContent="center"
                    sx={{ mt: 2 }}
                  >
                    <Button
                      component={Link}
                      to="/login"
                      variant="text"
                      color="inherit"
                      size="small"
                    >
                      Already have an account?
                    </Button>
                    <Button
                      component={Link}
                      to="/request-status"
                      variant="text"
                      color="primary"
                      size="small"
                    >
                      Check your request status
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 