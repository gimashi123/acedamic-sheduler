import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { z } from 'zod';
import { updateTimetable, getTimetableById } from '../timetableService';
import { toast } from 'react-hot-toast';
import { useTimetable } from '../../../contexts/TimetableContext';
import { ITimetable } from '../../../types/timetable';

interface UpdateTimetableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timetableId: string | null;
}

const timetableSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters long' }),
  groupName: z.string().min(1, { message: 'Group name is required' }),
  isPublished: z.boolean().default(false),
});

type TimetableFormValues = z.infer<typeof timetableSchema>;

const UpdateTimetableDialog: React.FC<UpdateTimetableDialogProps> = ({
  isOpen,
  onClose,
  timetableId
}) => {
  const { refetchTimetables } = useTimetable();
  const [formData, setFormData] = useState<TimetableFormValues>({
    title: '',
    description: '',
    groupName: '',
    isPublished: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TimetableFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (timetableId && isOpen) {
        try {
          setIsLoading(true);
          const timetable = await getTimetableById(timetableId);
          
          setFormData({
            title: timetable.title,
            description: timetable.description,
            groupName: timetable.group,
            isPublished: timetable.isPublished,
          });
        } catch (error) {
          console.error('Error fetching timetable:', error);
          toast.error('Failed to load timetable details');
          onClose();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTimetable();
  }, [timetableId, isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = (): boolean => {
    try {
      timetableSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof TimetableFormValues, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof TimetableFormValues] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !timetableId) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTimetable(timetableId, formData);
      toast.success('Timetable updated successfully');
      onClose();
      refetchTimetables();
    } catch (error) {
      toast.error('Failed to update timetable');
      console.error('Error updating timetable:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Timetable</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Update the timetable details below.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="groupName"
                label="Group Name"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                error={!!errors.groupName}
                helperText={errors.groupName}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished}
                    onChange={handleSwitchChange}
                    name="isPublished"
                    color="primary"
                  />
                }
                label="Publish Timetable"
                sx={{ mt: 1 }}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={isSubmitting || isLoading}
          variant="contained"
        >
          {isSubmitting ? 'Updating...' : 'Update Timetable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTimetableDialog; 