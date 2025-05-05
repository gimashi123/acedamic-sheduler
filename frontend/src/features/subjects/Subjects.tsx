import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import SubjectForm from './SubjectForm';
import SubjectList from './SubjectList';
import UpdateSubjectDialog from './UpdateSubjectDialog';
import { Subject } from '../../types';
import useAuthStore from '../../store/authStore';

const Subjects: React.FC = () => {
  const { user } = useAuthStore();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSuccess = () => {
    setRefresh(!refresh);
    setActiveTab(0); // Switch to list view after adding
  };

  const handleEditSubject = (subject: Subject) => {
    // Only allow editing for admin users
    if (!isAdmin) return;
    
    setSelectedSubject(subject);
    setUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    setRefresh(!refresh);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedSubject(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isAdmin ? 'Subject Management' : 'My Subjects'}
      </Typography>
      
      {/* Only show tabs for admin users */}
      {isAdmin ? (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="subject management tabs"
          >
            <Tab label="Subject List" />
            <Tab label="Add New Subject" />
          </Tabs>
        </Box>
      ) : null}

      {isAdmin && activeTab === 1 ? (
        <Box maxWidth="md" mx="auto">
          <SubjectForm onSuccess={handleSuccess} />
        </Box>
      ) : (
        <SubjectList 
          refresh={refresh}
          onEditSubject={isAdmin ? handleEditSubject : undefined}
        />
      )}

      {/* Only show update dialog for admin users */}
      {isAdmin && (
        <UpdateSubjectDialog
          open={updateDialogOpen}
          subject={selectedSubject}
          onClose={handleCloseUpdateDialog}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </Container>
  );
};

export default Subjects; 