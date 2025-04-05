import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper, Grid, Alert, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { SubjectFormData, createSubject, getLecturerSubjects } from './subjectService';

interface SubjectFormProps {
  onSuccess?: () => void;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasExistingSubject, setHasExistingSubject] = useState(false);
  const [checkingSubjects, setCheckingSubjects] = useState(true);

  // Check if lecturer already has a subject
  useEffect(() => {
    const checkExistingSubject = async () => {
      setCheckingSubjects(true);
      try {
        console.log('Checking for existing subjects');
        const subjects = await getLecturerSubjects();
        console.log('Fetched subjects:', subjects);
        if (subjects && subjects.length > 0) {
          setHasExistingSubject(true);
        }
      } catch (err: any) {
        console.error("Error checking existing subjects:", err);
        setError(err.response?.data?.message || 'Error loading subjects. Please try refreshing the page.');
      } finally {
        setCheckingSubjects(false);
      }
    };
    
    checkExistingSubject();
  }, []);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasExistingSubject) {
      setError('You already have a subject. A lecturer can only manage one subject.');
      return;
    }
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Subject name is required');
      return;
    }
    
    if (!formData.code.trim()) {
      setError('Subject code is required');
      return;
    }
    
    setError(null);
    setLoading(true);
    setSuccess(false);
    
    try {
      console.log('Submitting subject data:', formData);
      const result = await createSubject(formData);
      console.log('Subject creation result:', result);
      
      setSuccess(true);
      setFormData({
        name: '',
        code: '',
        description: '',
        credits: 3,
        department: '',
      });
      setHasExistingSubject(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error adding subject:', err);
      // Get detailed error if available
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        setError(errorData.message || errorData.error || 'Failed to create subject');
        console.error('Server error details:', errorData);
      } else {
        setError('Failed to create subject. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSubjects) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Subject
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Typography>Checking existing subjects...</Typography>
        </Box>
      </Paper>
    );
  }

  if (hasExistingSubject) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Subject
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          You have already added a subject. As a lecturer, you can only manage one subject at a time.
          Please go to "My Subjects" tab to view or manage your existing subject.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Subject
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
              placeholder="e.g. Introduction to Computer Science"
              margin="normal"
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
              placeholder="e.g. CS101"
              margin="normal"
              helperText="Unique code for this subject"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the subject"
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
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
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
              </Select>
              <FormHelperText>Number of credit hours</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              margin="normal"
            />
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