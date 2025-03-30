import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { 
  Group, 
  CreateGroupData, 
  createGroup, 
  updateGroup, 
  getFaculties, 
  getDepartments 
} from '../../utils/api/groupApi';

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: Group;
}

const initialFormData: CreateGroupData = {
  name: '',
  faculty: '',
  department: '',
  year: 1,
  semester: 1,
  groupType: 'weekday'
};

const GroupForm = ({ open, onClose, onSuccess, group }: GroupFormProps) => {
  const [formData, setFormData] = useState<CreateGroupData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateGroupData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const isEditMode = !!group;

  // Fetch faculties when component mounts
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setIsLoading(true);
        const data = await getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error('Error fetching faculties:', error);
        toast.error('Failed to load faculties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // Fetch departments when faculty changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.faculty) {
        setDepartments([]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getDepartments(formData.faculty);
        setDepartments(data);
        
        // If current department is not in the list of departments for this faculty, reset it
        if (formData.department && !data.includes(formData.department)) {
          setFormData(prev => ({
            ...prev,
            department: ''
          }));
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [formData.faculty]);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        faculty: group.faculty,
        department: group.department,
        year: group.year,
        semester: group.semester,
        groupType: group.groupType
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [group, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGroupData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (!formData.faculty.trim()) {
      newErrors.faculty = 'Faculty is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.year || formData.year < 1 || formData.year > 4) {
      newErrors.year = 'Year must be between 1 and 4';
    }
    
    if (!formData.semester || formData.semester < 1 || formData.semester > 2) {
      newErrors.semester = 'Semester must be 1 or 2';
    }
    
    if (!formData.groupType) {
      newErrors.groupType = 'Group type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when field is edited
      if (errors[name as keyof CreateGroupData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && group) {
        await updateGroup(group._id, formData);
        toast.success('Group updated successfully');
      } else {
        await createGroup(formData);
        toast.success('Group created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving group:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save group';
      
      // Check for specific validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? 'Edit Group' : 'Create New Group'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Group Name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={!!errors.faculty}
                disabled={loading || (isEditMode && group?.students.length > 0)}
                required
                variant="outlined"
              >
                <InputLabel id="faculty-label" shrink={!!formData.faculty}>Faculty</InputLabel>
                <Select
                  labelId="faculty-label"
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  label="Faculty"
                  onChange={handleChange}
                  notched
                >
                  {faculties.map(faculty => (
                    <MenuItem key={faculty} value={faculty}>{faculty}</MenuItem>
                  ))}
                </Select>
                {errors.faculty && (
                  <FormHelperText>{errors.faculty}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={!!errors.department}
                disabled={loading || !formData.faculty}
                required
                variant="outlined"
              >
                <InputLabel id="department-label" shrink={!!formData.department}>Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formData.department}
                  label="Department"
                  onChange={handleChange}
                  notched
                >
                  {departments.map(department => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <FormHelperText>{errors.department}</FormHelperText>
                )}
                {!formData.faculty && !errors.department && (
                  <FormHelperText>Select a faculty first</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="year"
                label="Year"
                type="number"
                fullWidth
                value={formData.year}
                onChange={handleChange}
                error={!!errors.year}
                helperText={errors.year || 'Between 1-4'}
                inputProps={{ min: 1, max: 4 }}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                name="semester"
                label="Semester"
                type="number"
                fullWidth
                value={formData.semester}
                onChange={handleChange}
                error={!!errors.semester}
                helperText={errors.semester || 'Either 1 or 2'}
                inputProps={{ min: 1, max: 2 }}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth 
                error={!!errors.groupType}
                disabled={loading}
                required
                variant="outlined"
              >
                <InputLabel id="group-type-label" shrink={!!formData.groupType}>Group Type</InputLabel>
                <Select
                  labelId="group-type-label"
                  id="group-type"
                  name="groupType"
                  value={formData.groupType}
                  label="Group Type"
                  onChange={handleChange}
                  notched
                >
                  <MenuItem value="weekday">Weekday</MenuItem>
                  <MenuItem value="weekend">Weekend</MenuItem>
                </Select>
                {errors.groupType && (
                  <FormHelperText>{errors.groupType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Group' : 'Create Group')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GroupForm; 