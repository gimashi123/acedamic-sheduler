import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Grid, Alert, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { SubjectFormData, addSubject } from './subjectService';
import { z } from 'zod';

interface SubjectFormProps {
  onSuccess?: () => void;
}

// Define validation schema with Zod
const subjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  code: z.string().length(6, "Code must be exactly 6 characters").regex(/^[A-Z]{2}\d{4}$/, "Code must be in format XX0000 (2 uppercase letters + 4 digits)"),
  credits: z.number().int().min(1, "Credits must be at least 1").max(4, "Credits must be at most 4")
});

const SubjectForm: React.FC<SubjectFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    credits: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setApiError(null);
    setLoading(true);
    setSuccess(false);
    
    try {
      await addSubject(formData);
      setSuccess(true);
      setFormData({
        name: '',
        code: '',
        credits: 3,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error adding subject:', err);
      if (err.response && err.response.data) {
        setApiError(err.response.data.message || 'Failed to create subject');
      } else {
        setApiError('Failed to create subject. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Subject
      </Typography>
      
      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Subject added successfully!</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Subject Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              margin="normal"
              error={!!errors.name}
              helperText={errors.name || "Min 2 characters, letters and spaces only"}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Subject Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. CS1001"
              margin="normal"
              error={!!errors.code}
              helperText={errors.code || "Format: XX0000 (2 uppercase letters + 4 digits)"}
            />
          </Grid>
          
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Adding...' : 'Add Subject'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SubjectForm; 