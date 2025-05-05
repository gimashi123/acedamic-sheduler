import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Box, Alert, CircularProgress, TextField, InputAdornment,
  IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Grid
} from '@mui/material';
import { Search, Delete, Edit, PersonAdd, Add } from '@mui/icons-material';
import { Subject, User, LecturerInfo } from '../../types';
import { getSubjects, deleteSubject, assignLecturer } from './subjectService';
import { getAllUsers } from '../../features/users/userService';
import SubjectForm from './SubjectForm';

const AdminSubjectList: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addSubjectDialogOpen, setAddSubjectDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectToAssign, setSubjectToAssign] = useState<Subject | null>(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [assignInProgress, setAssignInProgress] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjects();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subjects');
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLecturers = async () => {
    setLoadingLecturers(true);
    try {
      const users = await getAllUsers();
      // Filter only lecturers
      const lecturerUsers = users.filter(user => user.role === 'Lecturer');
      setLecturers(lecturerUsers);
    } catch (err) {
      console.error('Error loading lecturers:', err);
    } finally {
      setLoadingLecturers(false);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadLecturers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubjects(subjects);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSubjects(
        subjects.filter(
          (subject) =>
            subject.name.toLowerCase().includes(query) ||
            subject.code.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, subjects]);

  const handleOpenDeleteDialog = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleOpenAssignDialog = (subject: Subject) => {
    setSubjectToAssign(subject);
    
    // Set the initial selection to the current lecturer if any
    if (subject.lecturer && typeof subject.lecturer === 'object') {
      setSelectedLecturerId(subject.lecturer.id);
    } else if (typeof subject.lecturer === 'string') {
      setSelectedLecturerId(subject.lecturer);
    } else {
      setSelectedLecturerId('');
    }
    
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSubjectToAssign(null);
    setSelectedLecturerId('');
  };

  const handleLecturerChange = (event: SelectChangeEvent) => {
    setSelectedLecturerId(event.target.value);
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete?.id) return;
    
    setDeleteInProgress(true);
    try {
      const result = await deleteSubject(subjectToDelete.id);
      
      if (result.success) {
        // Remove the deleted subject from state
        const updatedSubjects = subjects.filter(s => s.id !== subjectToDelete.id);
        setSubjects(updatedSubjects);
        setFilteredSubjects(updatedSubjects.filter(
          (subject) => {
            if (searchQuery.trim() === '') return true;
            const query = searchQuery.toLowerCase();
            return subject.name.toLowerCase().includes(query) ||
              subject.code.toLowerCase().includes(query);
          }
        ));
        setSnackbarMessage('Subject deleted successfully');
      } else {
        setSnackbarMessage(result.message);
      }
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting subject:', err);
      setSnackbarMessage('An error occurred while deleting the subject');
      setSnackbarOpen(true);
    } finally {
      setDeleteInProgress(false);
      handleCloseDeleteDialog();
    }
  };

  const handleAssignLecturer = async () => {
    if (!subjectToAssign?.id) return;
    
    setAssignInProgress(true);
    try {
      // Use null if no lecturer is selected (to unassign)
      const lecturerId = selectedLecturerId === '' ? null : selectedLecturerId;
      const updatedSubject = await assignLecturer(subjectToAssign.id, lecturerId);
      
      // Update the subjects list with the updated subject
      const updatedSubjects = subjects.map(s => 
        s.id === updatedSubject.id ? updatedSubject : s
      );
      
      setSubjects(updatedSubjects);
      setFilteredSubjects(updatedSubjects.filter(
        (subject) => {
          if (searchQuery.trim() === '') return true;
          const query = searchQuery.toLowerCase();
          return subject.name.toLowerCase().includes(query) ||
            subject.code.toLowerCase().includes(query);
        }
      ));
      
      setSnackbarMessage(lecturerId 
        ? 'Lecturer assigned successfully' 
        : 'Lecturer unassigned successfully'
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error assigning lecturer:', err);
      setSnackbarMessage('An error occurred while assigning lecturer');
      setSnackbarOpen(true);
    } finally {
      setAssignInProgress(false);
      handleCloseAssignDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Helper function to get lecturer name
  const getLecturerName = (lecturer: string | LecturerInfo | null) => {
    if (!lecturer) return 'Not assigned';
    
    if (typeof lecturer === 'object') {
      return `${lecturer.firstName} ${lecturer.lastName}`;
    }
    
    // If it's just the ID, try to find the lecturer in our list
    const foundLecturer = lecturers.find(l => l._id === lecturer);
    return foundLecturer 
      ? `${foundLecturer.firstName} ${foundLecturer.lastName}` 
      : 'Unknown lecturer';
  };

  const handleOpenAddSubjectDialog = () => {
    setAddSubjectDialogOpen(true);
  };

  const handleCloseAddSubjectDialog = () => {
    setAddSubjectDialogOpen(false);
  };

  const handleSubjectAdded = () => {
    // Reload subjects after a new subject is added
    loadSubjects();
    handleCloseAddSubjectDialog();
    setSnackbarMessage('Subject added successfully');
    setSnackbarOpen(true);
  };

  if (loading && subjects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        All Subjects
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search by name or code"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenAddSubjectDialog}
          >
            Add New Subject
          </Button>
        </Grid>
      </Grid>
      
      {filteredSubjects.length === 0 ? (
        <Alert severity="info">No subjects found.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Assigned Lecturer</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>{getLecturerName(subject.lecturer)}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      size="small"
                      onClick={() => handleOpenAssignDialog(subject)}
                      title="Assign lecturer"
                      sx={{ mr: 1 }}
                    >
                      <PersonAdd fontSize="small" />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleOpenDeleteDialog(subject)}
                      title="Delete subject"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the subject "{subjectToDelete?.name} ({subjectToDelete?.code})"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
            disabled={deleteInProgress}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSubject} 
            color="error"
            disabled={deleteInProgress}
            autoFocus
          >
            {deleteInProgress ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Lecturer Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Lecturer to {subjectToAssign?.name}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth>
              <InputLabel id="lecturer-select-label">Lecturer</InputLabel>
              <Select
                labelId="lecturer-select-label"
                id="lecturer-select"
                value={selectedLecturerId}
                label="Lecturer"
                onChange={handleLecturerChange}
              >
                <MenuItem value="">
                  <em>None (Unassign)</em>
                </MenuItem>
                {lecturers.map((lecturer) => (
                  <MenuItem key={lecturer._id} value={lecturer._id}>
                    {lecturer.firstName} {lecturer.lastName} - {lecturer.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} disabled={assignInProgress}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignLecturer} 
            color="primary"
            variant="contained"
            disabled={assignInProgress}
            autoFocus
          >
            {assignInProgress ? 'Assigning...' : 'Assign Lecturer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog
        open={addSubjectDialogOpen}
        onClose={handleCloseAddSubjectDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <SubjectForm 
              onSuccess={handleSubjectAdded} 
              onCancel={handleCloseAddSubjectDialog}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AdminSubjectList; 