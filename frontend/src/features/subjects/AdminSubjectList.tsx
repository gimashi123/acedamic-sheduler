import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Box, Alert, CircularProgress, TextField, InputAdornment,
  IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar
} from '@mui/material';
import { Search, Delete } from '@mui/icons-material';
import { Subject } from '../../types';
import { getSubjects, deleteSubject } from './subjectService';

const AdminSubjectList: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
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

  useEffect(() => {
    loadSubjects();
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
      
      <Box mb={3}>
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
      </Box>
      
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
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell align="center">
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