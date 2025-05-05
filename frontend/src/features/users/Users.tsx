import React, { useState, useEffect } from 'react';
import { userService } from './userService';
import { User, RemovedUser } from '../../types';
import UserTable from './UserTable';
import RemovedUsersTable from './RemovedUsersTable';
import { Alert, CircularProgress, Snackbar, Paper, Tabs, Tab, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { Refresh, Search, Clear } from '@mui/icons-material';
import axios from 'axios';

const Users: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [removedUsers, setRemovedUsers] = useState<RemovedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removedUsersError, setRemovedUsersError] = useState<string | null>(null);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [filteredLecturers, setFilteredLecturers] = useState<User[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setRemovedUsersError(null);
    
    let errorMessages = [];
    
    try {
      // First, try to fetch students
      try {
        const studentData = await userService.getUsersByRole('Student');
        setStudents(studentData);
        setFilteredStudents(studentData);
      } catch (studentError) {
        console.error('Failed to fetch students:', studentError);
        errorMessages.push('Failed to load students');
      }
      
      // Then, try to fetch lecturers
      try {
        const lecturerData = await userService.getUsersByRole('Lecturer');
        setLecturers(lecturerData);
        setFilteredLecturers(lecturerData);
      } catch (lecturerError) {
        console.error('Failed to fetch lecturers:', lecturerError);
        errorMessages.push('Failed to load lecturers');
      }
      
      // Then, try to fetch removed users
      try {
        const removedData = await userService.getRemovedUsers();
        setRemovedUsers(removedData);
      } catch (removedError) {
        console.error('Failed to fetch removed users:', removedError);
        // Don't add to main error messages, handle separately
        setRemovedUsersError('Could not load removed users. The feature may not be fully set up yet.');
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

  // Separate function to refresh only the removed users list
  const refreshRemovedUsers = async () => {
    setRemovedUsersError(null);
    try {
      console.log('Attempting to refresh removed users list');
      const removedData = await userService.getRemovedUsers();
      setRemovedUsers(removedData);
      console.log(`Successfully loaded ${removedData.length} removed users`);
    } catch (error) {
      console.error('Error refreshing removed users:', error);
      // Provide a more detailed error message based on the error type
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setRemovedUsersError('Authentication error. Please try logging out and back in.');
        } else if (error.response?.status === 404) {
          setRemovedUsersError('The removed users endpoint was not found. The backend may need to be updated.');
        } else if (error.response && error.response.status >= 500) {
          setRemovedUsersError('Server error occurred. Please try again later or contact the administrator.');
        } else {
          setRemovedUsersError(`Could not load removed users: ${error.response?.statusText || error.message}`);
        }
      } else {
        setRemovedUsersError('Could not load removed users. The feature may not be fully set up yet.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
      setFilteredLecturers(lecturers);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter students
    const matchingStudents = students.filter(
      student => 
        student.firstName.toLowerCase().includes(query) || 
        student.lastName.toLowerCase().includes(query) || 
        student.email.toLowerCase().includes(query)
    );
    setFilteredStudents(matchingStudents);
    
    // Filter lecturers
    const matchingLecturers = lecturers.filter(
      lecturer => 
        lecturer.firstName.toLowerCase().includes(query) || 
        lecturer.lastName.toLowerCase().includes(query) || 
        lecturer.email.toLowerCase().includes(query)
    );
    setFilteredLecturers(matchingLecturers);
  }, [searchQuery, students, lecturers]);

  const handleRemoveUser = async (userId: string, reason?: string) => {
    try {
      await userService.removeUser(userId, reason);
      
      // Find the removed user before updating state
      const removedStudent = students.find(student => student._id === userId);
      const removedLecturer = lecturers.find(lecturer => lecturer._id === userId);
      const removedUser = removedStudent || removedLecturer;
      
      // Update local state
      setStudents(prevStudents => prevStudents.filter(student => student._id !== userId));
      setLecturers(prevLecturers => prevLecturers.filter(lecturer => lecturer._id !== userId));
      
      // Refresh removed users list
      refreshRemovedUsers();
      
      setSnackbar({
        open: true,
        message: `${removedUser?.firstName} ${removedUser?.lastName} was removed successfully. An email notification has been sent.`,
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
    
    // If switching to removed users tab, try to refresh the data
    if (newValue === 2 && removedUsersError) {
      refreshRemovedUsers();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
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
      
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
        <Paper className="flex-grow" elevation={0}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`Students (${filteredStudents.length}/${students.length})`} />
            <Tab label={`Lecturers (${filteredLecturers.length}/${lecturers.length})`} />
            <Tab label={`Removed Users (${removedUsers.length})`} />
          </Tabs>
        </Paper>
        
        {/* Only show search for the first two tabs */}
        {tabValue !== 2 && (
          <div className="w-full md:w-1/3">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={clearSearch}
                      edge="end"
                      size="small"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </div>
        )}
      </div>

      {tabValue === 0 && (
        <UserTable 
          users={filteredStudents} 
          title="Students" 
          onRemoveUser={handleRemoveUser}
          onUserUpdated={fetchUsers}
        />
      )}
      
      {tabValue === 1 && (
        <UserTable 
          users={filteredLecturers} 
          title="Lecturers" 
          onRemoveUser={handleRemoveUser}
          onUserUpdated={fetchUsers}
        />
      )}
      
      {tabValue === 2 && (
        <>
          {removedUsersError && (
            <Alert 
              severity="warning" 
              className="mb-4"
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  startIcon={<Refresh />}
                  onClick={refreshRemovedUsers}
                >
                  Retry
                </Button>
              }
            >
              {removedUsersError}
            </Alert>
          )}
          <RemovedUsersTable 
            removedUsers={removedUsers} 
          />
        </>
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