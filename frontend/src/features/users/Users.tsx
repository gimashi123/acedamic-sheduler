import React, { useState, useEffect } from 'react';
import { userService } from './userService';
import { User } from '../../types';
import UserTable from './UserTable';
import { Alert, CircularProgress, Snackbar, Paper, Tabs, Tab, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const Users: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [tabValue, setTabValue] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    let errorMessages = [];
    
    try {
      // First, try to fetch students
      try {
        const studentData = await userService.getUsersByRole('Student');
        setStudents(studentData);
      } catch (studentError) {
        console.error('Failed to fetch students:', studentError);
        errorMessages.push('Failed to load students');
      }
      
      // Then, try to fetch lecturers
      try {
        const lecturerData = await userService.getUsersByRole('Lecturer');
        setLecturers(lecturerData);
      } catch (lecturerError) {
        console.error('Failed to fetch lecturers:', lecturerError);
        errorMessages.push('Failed to load lecturers');
      }
      
      // Set error message if any errors occurred
      if (errorMessages.length > 0) {
        setError(errorMessages.join('; '));
      }
    } catch (error) {
      console.error('General error fetching users:', error);
      setError('Failed to load users. Please make sure the backend server is running and you are authenticated.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRemoveUser = async (userId: string) => {
    try {
      await userService.removeUser(userId);
      // Update local state
      setStudents(prevStudents => prevStudents.filter(student => student._id !== userId));
      setLecturers(prevLecturers => prevLecturers.filter(lecturer => lecturer._id !== userId));
      
      setSnackbar({
        open: true,
        message: 'User removed successfully. An email notification has been sent.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing user:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove user. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {error && (
        <Alert 
          severity="error" 
          className="mb-4"
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<Refresh />}
              onClick={fetchUsers}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <Paper className="mb-6" elevation={0}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Students (${students.length})`} />
          <Tab label={`Lecturers (${lecturers.length})`} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <UserTable 
          users={students} 
          title="Students" 
          onRemoveUser={handleRemoveUser} 
        />
      )}
      
      {tabValue === 1 && (
        <UserTable 
          users={lecturers} 
          title="Lecturers" 
          onRemoveUser={handleRemoveUser} 
        />
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          elevation={6} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Users; 