import React, { useState } from 'react';
import { Container, Typography, Box, Divider, Tabs, Tab } from '@mui/material';
import SubjectForm from './SubjectForm';
import SubjectList from './SubjectList';
import { Subject } from './subjectService';
import useAuthStore from '../../store/authStore';

const Subjects: React.FC = () => {
  const { user } = useAuthStore();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSuccess = () => {
    setRefresh(!refresh);
  };

  // Only allow access to lecturers
  if (!user || user.role !== 'Lecturer') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">
          Access denied. Only lecturers can access this page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subject Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="subject management tabs"
        >
          <Tab label="My Subjects" />
          <Tab label="Add New Subject" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <SubjectList 
          refresh={refresh}
        />
      ) : (
        <Box maxWidth="md" mx="auto">
          <SubjectForm onSuccess={handleSuccess} />
        </Box>
      )}
    </Container>
  );
};

export default Subjects; 