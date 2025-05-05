import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormHelperText,
  FormLabel,
  IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useTimetable } from '../../../../contexts/TimetableContext';
import { updateTimetable } from '../../timetableService';
import { Edit } from '@mui/icons-material';
import { ITimetable } from '../../../../types/timetable';

// Define Form Schema using Zod
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  groupName: z.string().min(2, { message: "Group name must be at least 2 characters." }),
  isPublished: z.boolean(),
});

// Define TypeScript type for form data
type FormValues = z.infer<typeof formSchema>;

interface UpdateTimeTableDetailsDialogProps {
  timetable: ITimetable;
}

export const UpdateTimeTableDetailsDialog: React.FC<UpdateTimeTableDetailsDialogProps> = ({ timetable }) => {
  const [open, setOpen] = useState(false);
  const { refetchTimetables } = useTimetable();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: timetable.title,
      description: timetable.description,
      groupName: timetable.group,
      isPublished: timetable.isPublished,
    },
  });

  // Update form when timetable prop changes
  useEffect(() => {
    if (timetable) {
      reset({
        title: timetable.title,
        description: timetable.description,
        groupName: timetable.group,
        isPublished: timetable.isPublished,
      });
    }
  }, [timetable, reset]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      await updateTimetable(timetable.id, {
        title: data.title,
        description: data.description,
        groupName: data.groupName,
        isPublished: data.isPublished,
      });
      toast.success("Timetable updated successfully!");
      refetchTimetables();
      handleClose();
    } catch (error) {
      console.error("Error updating timetable:", error);
      toast.error("Error updating timetable.");
    }
  };

  return (
    <>
      <IconButton 
        color="primary" 
        onClick={handleOpen} 
        size="small"
        title="Edit timetable"
      >
        <Edit />
      </IconButton>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Timetable Details</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Update details for the timetable
          </Typography>
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="title"
                  label="Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="description"
                  label="Description"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="groupName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="groupName"
                  label="Group Name"
                  error={!!errors.groupName}
                  helperText={errors.groupName?.message}
                />
              )}
            />

            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Publication Status</FormLabel>
                  <RadioGroup 
                    {...field}
                    value={field.value ? 'true' : 'false'} 
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                    row
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Published" />
                    <FormControlLabel value="false" control={<Radio />} label="Not Published" />
                  </RadioGroup>
                  {errors.isPublished && (
                    <FormHelperText error>{errors.isPublished.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
            Update Timetable
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};