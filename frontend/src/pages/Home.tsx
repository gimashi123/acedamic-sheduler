import React from 'react';
import { Container, Box, Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 8,
            px: 4,
            borderRadius: 2,
            mb: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Academic Scheduler
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Streamline your academic scheduling process
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
            Our platform helps educational institutions manage courses, schedules, and resources efficiently.
            Whether you're a student, lecturer, or administrator, we've got you covered.
          </Typography>
          {!isAuthenticated() && (
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mx: 1, mb: { xs: 2, sm: 0 } }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                color="inherit"
                size="large"
                sx={{ mx: 1 }}
              >
                Register
              </Button>
            </Box>
          )}
          {isAuthenticated() && (
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              color="secondary"
              size="large"
            >
              Go to Dashboard
            </Button>
          )}
        </Box>

        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 4 }}>
          Features
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                For Students
              </Typography>
              <Typography variant="body1" paragraph>
                • View your class schedule<br />
                • Track course enrollments<br />
                • Receive notifications about schedule changes<br />
                • Access course materials
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                For Lecturers
              </Typography>
              <Typography variant="body1" paragraph>
                • Manage your teaching schedule<br />
                • Track student attendance<br />
                • Coordinate with other faculty members<br />
                • Request venue changes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                For Administrators
              </Typography>
              <Typography variant="body1" paragraph>
                • Manage users and permissions<br />
                • Allocate venues and resources<br />
                • Create and modify schedules<br />
                • Generate reports
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to get started?
          </Typography>
          {!isAuthenticated() && (
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Create an Account
            </Button>
          )}
          {isAuthenticated() && (
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 