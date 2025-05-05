import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Box, IconButton, Button, Alert, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, CircularProgress,
  TextField, InputAdornment
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { Subject } from '../../types';
import { getSubjects, deleteSubject, getLecturerSubjects } from './subjectService';
import useAuthStore from '../../store/authStore';

interface SubjectListProps {
  onEditSubject?: (subject: Subject) => void;
  refresh?: boolean;
}

const SubjectList: React.FC<SubjectListProps> = ({ onEditSubject, refresh }) => {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'Admin';
  const isLecturer = user?.role === 'Lecturer';

  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      // If user is a lecturer, only get their assigned subjects
      if (isLecturer) {
        data = await getLecturerSubjects();
      } else {
        // Otherwise get all subjects (for admin)
        data = await getSubjects();
      }
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
  }, [refresh]);

  // Filter subjects when search query changes
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

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete?.id) return;
    
    setDeleteLoading(true);
    try {
      await deleteSubject(subjectToDelete.id);
      setSubjects(subjects.filter(s => s.id !== subjectToDelete.id));
      setFilteredSubjects(filteredSubjects.filter(s => s.id !== subjectToDelete.id));
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete subject');
      console.error('Error deleting subject:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  if (loading && subjects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            {isLecturer ? 'My Assigned Subjects' : 'Subjects'}
          </Typography>
        </Box>

        {/* Search input field */}
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
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {filteredSubjects.length === 0 ? (
          <Alert severity="info">No subjects available.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Credits</TableCell>
                  {/* Only show Actions column for admin users */}
                  {isAdmin && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    {/* Only show action buttons for admin users */}
                    {isAdmin && (
                      <TableCell align="right">
                        {onEditSubject && (
                          <IconButton 
                            size="small" 
                            onClick={() => onEditSubject(subject)}
                            aria-label="edit"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(subject)}
                          aria-label="delete"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {subjectToDelete?.name} ({subjectToDelete?.code})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : undefined}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubjectList; 