import React from 'react';
import { Container, Typography, Box } from '@mui/material';
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
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          This page displays all subjects across the institution. You can view which lecturer is teaching each subject.
        </Typography>
      </Box>

      <AdminSubjectList />
    </Container>
  );
};

export default AdminSubjects; 