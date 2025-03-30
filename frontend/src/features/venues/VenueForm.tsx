import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { Venue, CreateVenueData, createVenue, updateVenue } from '../../utils/api/venueApi';

interface VenueFormProps {
  open: boolean;
  onClose: () => void;
  venue: Venue | null;
  onSuccess: () => void;
}

interface FormErrors {
  faculty?: string;
  department?: string;
  building?: string;
  hallName?: string;
  type?: string;
  capacity?: string;
}

const VenueForm = ({ open, onClose, venue, onSuccess }: VenueFormProps) => {
  const isEditing = !!venue;
  
  const [formData, setFormData] = useState<CreateVenueData>({
    faculty: '',
    department: '',
    building: '',
    hallName: '',
    type: 'lecture',
    capacity: 30
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Venue type options
  const venueTypeOptions = [
    { value: 'lecture', label: 'Lecture Hall' },
    { value: 'tutorial', label: 'Tutorial Room' },
    { value: 'lab', label: 'Laboratory' }
  ];

  // Faculty options
  const facultyOptions = [
    'Faculty of Computing',
    'Faculty of Business',
    'Faculty of Engineering',
    'Faculty of Humanities & Sciences'
  ];

  // Department options (based on selected faculty)
  const getDepartmentOptions = (faculty: string) => {
    switch (faculty) {
      case 'Faculty of Computing':
        return [
          'Computer Science',
          'Software Engineering',
          'Computer Engineering',
          'Data Science',
          'Information Systems',
          'Cyber Security'
        ];
      case 'Faculty of Business':
        return [
          'Business Administration',
          'Accounting & Finance',
          'Marketing',
          'Human Resource Management'
        ];
      case 'Faculty of Engineering':
        return [
          'Civil Engineering',
          'Mechanical Engineering',
          'Electrical Engineering',
          'Electronics Engineering'
        ];
      case 'Faculty of Humanities & Sciences':
        return [
          'Psychology',
          'Languages',
          'Mathematics',
          'Physics',
          'Chemistry'
        ];
      default:
        return [];
    }
  };

  // Building options (examples)
  const buildingOptions = [
    'Main Building',
    'Science Tower',
    'Engineering Block',
    'Business Center',
    'Library Building',
    'Research Complex'
  ];

  useEffect(() => {
    if (venue) {
      setFormData({
        faculty: venue.faculty,
        department: venue.department,
        building: venue.building,
        hallName: venue.hallName,
        type: venue.type,
        capacity: venue.capacity
      });
    } else {
      // Reset form for new venue
      setFormData({
        faculty: '',
        department: '',
        building: '',
        hallName: '',
        type: 'lecture',
        capacity: 30
      });
    }
    
    setErrors({});
  }, [venue, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value);
    
    if (!isNaN(numberValue)) {
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    }
    
    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset department if faculty changes
    if (name === 'faculty') {
      setFormData(prev => ({ ...prev, faculty: value as string, department: '' }));
    }
    
    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.faculty) {
      newErrors.faculty = 'Faculty is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.building) {
      newErrors.building = 'Building is required';
    }
    
    if (!formData.hallName.trim()) {
      newErrors.hallName = 'Hall name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Venue type is required';
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing && venue) {
        await updateVenue(venue._id, formData);
        toast.success('Venue updated successfully');
      } else {
        await createVenue(formData);
        toast.success('Venue created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving venue:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save venue';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.faculty} required>
              <InputLabel>Faculty</InputLabel>
              <Select
                name="faculty"
                value={formData.faculty}
                onChange={handleSelectChange}
                label="Faculty"
              >
                {facultyOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.faculty && <FormHelperText>{errors.faculty}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.department} required disabled={!formData.faculty}>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleSelectChange}
                label="Department"
              >
                {getDepartmentOptions(formData.faculty).map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.building} required>
              <InputLabel>Building</InputLabel>
              <Select
                name="building"
                value={formData.building}
                onChange={handleSelectChange}
                label="Building"
              >
                {buildingOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.building && <FormHelperText>{errors.building}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="hallName"
              label="Hall Name"
              fullWidth
              value={formData.hallName}
              onChange={handleChange}
              error={!!errors.hallName}
              helperText={errors.hallName}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.type} required>
              <InputLabel>Venue Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Venue Type"
              >
                {venueTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="capacity"
              label="Capacity"
              type="number"
              fullWidth
              value={formData.capacity}
              onChange={handleNumberChange}
              error={!!errors.capacity}
              helperText={errors.capacity}
              required
              inputProps={{
                min: 1,
                step: 1
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VenueForm; 