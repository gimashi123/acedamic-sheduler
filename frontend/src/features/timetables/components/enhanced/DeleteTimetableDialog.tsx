import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import { deleteTimetable } from '../../timetableService';
import { useTimetable } from '../../../../contexts/TimetableContext';
import { DeleteOutline } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { ITimetable } from '../../../../types/timetable';

interface DeleteTimetableDialogProps {
  timetable: ITimetable;
}

export const DeleteTimetableDialog: React.FC<DeleteTimetableDialogProps> = ({ timetable }) => {
  const [open, setOpen] = useState(false);
  const { refetchTimetables } = useTimetable();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTimetable(timetable.id);
      toast.success('Timetable deleted successfully!');
      refetchTimetables();
      handleClose();
    } catch (error) {
      console.error('Error deleting timetable:', error);
      toast.error('Failed to delete timetable.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <IconButton 
        color="error" 
        onClick={handleOpen} 
        size="small"
        title="Delete timetable"
      >
        <DeleteOutline />
      </IconButton>
      
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the timetable "<strong>{timetable.title}</strong>"?
            <br /><br />
            This action cannot be undone. All data associated with this timetable will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};