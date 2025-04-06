import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Box, IconButton, Chip, Button, Alert, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, CircularProgress
} from '@mui/material';
import { Edit, Delete, PictureAsPdf } from '@mui/icons-material';
import { Subject, getLecturerSubjects, deleteSubject } from './subjectService';
import { exportToPdf } from '../../utils/pdfExport';
import toast from 'react-hot-toast';

interface SubjectListProps {
  onEditSubject?: (subject: Subject) => void;
  refresh?: boolean;
}

const SubjectList: React.FC<SubjectListProps> = ({ onEditSubject, refresh }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLecturerSubjects();
      setSubjects(data);
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

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete?._id) return;
    
    setDeleteLoading(true);
    try {
      await deleteSubject(subjectToDelete._id);
      setSubjects(subjects.filter(s => s._id !== subjectToDelete._id));
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

  const handleExportToPdf = () => {
    const columns = [
      { header: 'Code', dataKey: 'code' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Credits', dataKey: 'credits' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Status', dataKey: 'status' }
    ];

    exportToPdf({
      title: 'My Subjects',
      filename: `subjects-list-${new Date().toISOString().split('T')[0]}`,
      columns,
      data: subjects,
      orientation: 'portrait',
      includeTimestamp: true
    });

    toast.success('Subject list exported to PDF successfully');
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
            My Subjects
          </Typography>
          {subjects.length > 0 && (
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdf />} 
              onClick={handleExportToPdf}
              size="small"
            >
              Export PDF
            </Button>
          )}
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {subjects.length === 0 ? (
          <Alert severity="info">You haven't added any subjects yet.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>{subject.department || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={subject.status} 
                        color={subject.status === 'active' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
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