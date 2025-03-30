// SubjectForm component - recreated to resolve TypeScript module resolution issue
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
import { Subject, CreateSubjectData, createSubject, updateSubject } from '../../utils/api/subjectApi';

interface SubjectFormProps {
  open: boolean;
  onClose: () => void;
  subject: Subject | null;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  moduleCode?: string;
  credit?: string;
  department?: string;
  faculty?: string;
}

const SubjectForm = ({ open, onClose, subject, onSuccess }: SubjectFormProps) => {
  const isEditing = !!subject;
  
  const [formData, setFormData] = useState<CreateSubjectData>({
    name: '',
    moduleCode: '',
    credit: 1,
    description: '',
    department: '',
    faculty: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Credit options (1-4)
  const creditOptions = [1, 2, 3, 4];

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

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        moduleCode: subject.moduleCode,
        credit: subject.credit,
        description: subject.description,
        department: subject.department,
        faculty: subject.faculty
      });
    } else {
      // Reset form for new subject
      setFormData({
        name: '',
        moduleCode: '',
        credit: 1,
        description: '',
        department: '',
        faculty: ''
      });
    }
    
    setErrors({});
  }, [subject, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is being edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCreditChange = (e: SelectChangeEvent<number>) => {
    setFormData(prev => ({ ...prev, credit: e.target.value as number }));
    
    // Clear error when field is being edited
    if (errors.credit) {
      setErrors(prev => ({ ...prev, credit: undefined }));
    }
  };

  const handleFacultyChange = (e: SelectChangeEvent) => {
    const faculty = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      faculty, 
      department: '' // Reset department when faculty changes
    }));
    
    // Clear errors
    if (errors.faculty) {
      setErrors(prev => ({ ...prev, faculty: undefined }));
    }
  };

  const handleDepartmentChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, department: e.target.value }));
    
    // Clear error when field is being edited
    if (errors.department) {
      setErrors(prev => ({ ...prev, department: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }
    
    if (!formData.moduleCode.trim()) {
      newErrors.moduleCode = 'Module code is required';
    }
    
    if (!formData.credit || formData.credit < 1 || formData.credit > 4) {
      newErrors.credit = 'Credit must be between 1 and 4';
    }

    if (!formData.faculty) {
      newErrors.faculty = 'Faculty is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing && subject) {
        await updateSubject(subject._id, formData);
        toast.success('Subject updated successfully');
      } else {
        await createSubject(formData);
        toast.success('Subject created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save subject';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Subject Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="moduleCode"
              label="Module Code"
              fullWidth
              value={formData.moduleCode}
              onChange={handleChange}
              error={!!errors.moduleCode}
              helperText={errors.moduleCode}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.credit} required>
              <InputLabel>Credit</InputLabel>
              <Select
                value={formData.credit}
                onChange={handleCreditChange}
                label="Credit"
              >
                {creditOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errors.credit && <FormHelperText>{errors.credit}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.faculty} required>
              <InputLabel>Faculty</InputLabel>
              <Select
                value={formData.faculty}
                onChange={handleFacultyChange}
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

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.department} required disabled={!formData.faculty}>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleDepartmentChange}
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
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
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

export default SubjectForm; 