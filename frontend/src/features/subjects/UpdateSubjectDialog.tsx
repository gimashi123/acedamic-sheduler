import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, Button, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, Box, Alert, CircularProgress
} from '@mui/material';
import { z } from 'zod';
import { Subject } from '../../types';
import { SubjectFormData, updateSubject } from './subjectService';

interface UpdateSubjectDialogProps {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Define validation schema with Zod
const subjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  code: z.string().length(6, "Code must be exactly 6 characters").regex(/^[A-Z]{2}\d{4}$/, "Code must be in format XX0000 (2 uppercase letters + 4 digits)"),
  credits: z.number().int().min(1, "Credits must be at least 1").max(4, "Credits must be at most 4")
});

const UpdateSubjectDialog: React.FC<UpdateSubjectDialogProps> = ({ 
  open, 
  subject, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    credits: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        credits: subject.credits,
      });
    }
  }, [subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? Number(value) : value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    try {
      subjectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!subject?.id || !validateForm()) {
      return;
    }
    
    setApiError(null);
    setLoading(true);
    
    try {
      await updateSubject(subject.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating subject:', err);
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Failed to update subject');
      } else {
        setApiError('Failed to update subject. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Subject</DialogTitle>
      <DialogContent>
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        
        <Box sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="Subject Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            error={!!errors.name}
            helperText={errors.name || "Min 2 characters, letters and spaces only"}
          />
          
          <TextField
            required
            fullWidth
            label="Subject Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            margin="normal"
            error={!!errors.code}
            helperText={errors.code || "Format: XX0000 (2 uppercase letters + 4 digits)"}
          />
          
          <FormControl fullWidth margin="normal" error={!!errors.credits}>
            <InputLabel id="credits-label">Credits</InputLabel>
            <Select
              labelId="credits-label"
              name="credits"
              value={formData.credits}
              onChange={handleSelectChange}
              label="Credits"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
            </Select>
            <FormHelperText>{errors.credits || "Number between 1-4"}</FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Subject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateSubjectDialog; 