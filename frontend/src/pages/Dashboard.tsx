import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChangePasswordDialog from '../components/ChangePasswordDialog';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    // Check if the user needs to change their password
    if (user?.passwordChangeRequired) {
      setShowPasswordDialog(true);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordDialogClose = () => {
    // Only allow closing if not a required password change
    if (!user?.passwordChangeRequired) {
      setShowPasswordDialog(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">
            You are not logged in. Please log in to access the dashboard.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user.firstName} {user.lastName}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Role: {user.role}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email: {user.email}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Admin-specific cards */}
          {user.role === 'Admin' && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Management
                    </Typography>
                    <Typography variant="body2">
                      Manage users, approve registration requests, and assign roles.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Manage Users</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Registration Requests
                    </Typography>
                    <Typography variant="body2">
                      Review and approve pending registration requests.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/manage-requests')}>Manage Requests</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      System Settings
                    </Typography>
                    <Typography variant="body2">
                      Configure system settings and preferences.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/settings')}>Settings</Button>
                  </CardActions>
                </Card>
              </Grid>
            </>
          )}

          {/* Lecturer-specific cards */}
          {user.role === 'Lecturer' && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Courses
                    </Typography>
                    <Typography variant="body2">
                      Manage your courses, schedules, and student enrollments.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Courses</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Schedule Management
                    </Typography>
                    <Typography variant="body2">
                      View and manage your teaching schedule.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Schedule</Button>
                  </CardActions>
                </Card>
              </Grid>
            </>
          )}

          {/* Student-specific cards */}
          {user.role === 'Student' && (
            <>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Courses
                    </Typography>
                    <Typography variant="body2">
                      View your enrolled courses and schedules.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Courses</Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      My Schedule
                    </Typography>
                    <Typography variant="body2">
                      View your class schedule and upcoming events.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Schedule</Button>
                  </CardActions>
                </Card>
              </Grid>
            </>
          )}

          {/* Common cards for all roles */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile
                </Typography>
                <Typography variant="body2">
                  View and update your profile information.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit Profile</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Account Settings section */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {/* Only show Change Password button for Lecturers and Students */}
            {(user.role === 'Lecturer' || user.role === 'Student') && (
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Password change dialog */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        defaultPassword={user.defaultPassword}
      />
    </Container>
  );
};

export default Dashboard; 