import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import AdminSubjectList from './AdminSubjectList';
import useAuthStore from '../../store/authStore';

const AdminSubjects: React.FC = () => {
  const { user } = useAuthStore();

  // Only allow access to admins
  if (!user || user.role !== 'Admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">
          Access denied. Only administrators can access this page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subjects Management
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          About Subject Management
        </Typography>
        
        <Typography variant="body1" paragraph>
          As an administrator, you have full control over subject management:
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li">
            <Typography variant="body1">
              <strong>Add new subjects</strong> to the system using the "Add New Subject" button
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>Assign lecturers</strong> to subjects using the person icon in the actions column
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>Delete subjects</strong> that are no longer needed using the delete icon
            </Typography>
          </Box>
        </Box>
      </Paper>

      <AdminSubjectList />
    </Container>
  );
};

export default AdminSubjects; 