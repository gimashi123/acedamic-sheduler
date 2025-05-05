import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import { z } from 'zod';
import { createTimetable } from '../timetableService';
import { toast } from 'react-hot-toast';
import { useTimetable } from '../../../contexts/TimetableContext';

interface AddTimetableDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const timetableSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters long' }),
  groupName: z.string().min(1, { message: 'Group name is required' }),
  isPublished: z.boolean().default(false),
});

type TimetableFormValues = z.infer<typeof timetableSchema>;

const AddTimetableDialog: React.FC<AddTimetableDialogProps> = ({ isOpen, onClose }) => {
  const { refetchTimetables } = useTimetable();
  const [formData, setFormData] = useState<TimetableFormValues>({
    title: '',
    description: '',
    groupName: '',
    isPublished: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TimetableFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createTimetable(formData);
      toast.success('Timetable created successfully');
      setFormData({
        title: '',
        description: '',
        groupName: '',
        isPublished: false,
      });
      onClose();
      refetchTimetables();
    } catch (error) {
      toast.error('Failed to create timetable');
      console.error('Error creating timetable:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      groupName: '',
      isPublished: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Timetable</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Create a new timetable for your academic schedule. Fill in the details below.
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={isSubmitting}
          variant="contained"
        >
          {isSubmitting ? 'Creating...' : 'Create Timetable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTimetableDialog; 