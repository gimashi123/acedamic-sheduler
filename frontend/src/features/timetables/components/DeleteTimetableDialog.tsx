import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { deleteTimetable } from '../timetableService';
import { toast } from 'react-hot-toast';
import { useTimetable } from '../../../contexts/TimetableContext';

interface DeleteTimetableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timetableId: string | null;
  timetableTitle: string;
}

const DeleteTimetableDialog: React.FC<DeleteTimetableDialogProps> = ({
  isOpen,
  onClose,
  timetableId,
  timetableTitle
}) => {
  const { refetchTimetables } = useTimetable();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!timetableId) return;

    try {
      setIsDeleting(true);
      await deleteTimetable(timetableId);
      toast.success('Timetable deleted successfully');
      refetchTimetables();
      onClose();
    } catch (error) {
      toast.error('Failed to delete timetable');
      console.error('Error deleting timetable:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm">
      <DialogTitle>Delete Timetable</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Delete color="error" sx={{ mr: 2 }} />
          <Typography variant="body1">
            Are you sure you want to delete the timetable: <strong>{timetableTitle}</strong>?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. All data associated with this timetable will be permanently removed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          disabled={isDeleting}
          variant="contained"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTimetableDialog; 