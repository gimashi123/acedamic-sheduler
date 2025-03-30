import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { Add as AddIcon, FilterAlt as FilterIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { 
  getAllGroups, 
  Group, 
  getFaculties, 
  getDepartments, 
  GroupFilters
} from '../../utils/api/groupApi';
import GroupList from './GroupList.tsx';
import GroupForm from './GroupForm';
import useAuthStore from '../../store/authStore';
import StudentManagement from './StudentManagement';

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [openStudentAssignment, setOpenStudentAssignment] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  // Filtering states
  const [faculties, setFaculties] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState<GroupFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load faculties on component mount
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const data = await getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error('Error loading faculties:', error);
      }
    };

    loadFaculties();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    const loadDepartments = async () => {
      if (!filters.faculty) {
        setDepartments([]);
        return;
      }

      try {
        const data = await getDepartments(filters.faculty);
        setDepartments(data);
        
        // If current department is not valid for the new faculty, reset it
        if (filters.department && !data.includes(filters.department)) {
          setFilters(prev => ({ ...prev, department: undefined }));
        }
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };

    loadDepartments();
  }, [filters.faculty]);

  useEffect(() => {
    fetchGroups();
  }, [filters]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getAllGroups(filters);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    
    if (value === '') {
      // Remove the filter
      const newFilters = { ...filters };
      delete newFilters[name as keyof GroupFilters];
      setFilters(newFilters);
    } else {
      // Add/update the filter
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleOpenForm = (group: Group | null = null) => {
    setCurrentGroup(group);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setCurrentGroup(null);
    setOpenForm(false);
  };

  const handleOpenStudentAssignment = (group: Group) => {
    setCurrentGroup(group);
    setOpenStudentAssignment(true);
  };

  const handleCloseStudentAssignment = () => {
    setOpenStudentAssignment(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchGroups();
  };

  const handleStudentAssignmentSuccess = () => {
    handleCloseStudentAssignment();
    fetchGroups();
  };

  // Count the number of active filters
  const activeFilterCount = Object.keys(filters).length;

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" align="center">
            You don't have permission to access this page
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Group Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {activeFilterCount > 0 && (
              <Chip 
                label={activeFilterCount} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Filters</Typography>
            {activeFilterCount > 0 && (
              <Button 
                size="small" 
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="faculty-filter-label" shrink>Faculty</InputLabel>
                <Select
                  labelId="faculty-filter-label"
                  id="faculty-filter"
                  name="faculty"
                  value={filters.faculty || ''}
                  label="Faculty"
                  onChange={handleFilterChange}
                  displayEmpty
                  notched
                >
                  <MenuItem value=""><em>All Faculties</em></MenuItem>
                  {faculties.map(faculty => (
                    <MenuItem key={faculty} value={faculty}>{faculty}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" variant="outlined" disabled={!filters.faculty}>
                <InputLabel id="department-filter-label" shrink>Department</InputLabel>
                <Select
                  labelId="department-filter-label"
                  id="department-filter"
                  name="department"
                  value={filters.department || ''}
                  label="Department"
                  onChange={handleFilterChange}
                  displayEmpty
                  notched
                >
                  <MenuItem value=""><em>All Departments</em></MenuItem>
                  {departments.map(department => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="year-filter-label" shrink>Year</InputLabel>
                <Select
                  labelId="year-filter-label"
                  id="year-filter"
                  name="year"
                  value={filters.year?.toString() || ''}
                  label="Year"
                  onChange={handleFilterChange}
                  displayEmpty
                  notched
                >
                  <MenuItem value=""><em>All Years</em></MenuItem>
                  <MenuItem value="1">Year 1</MenuItem>
                  <MenuItem value="2">Year 2</MenuItem>
                  <MenuItem value="3">Year 3</MenuItem>
                  <MenuItem value="4">Year 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="semester-filter-label" shrink>Semester</InputLabel>
                <Select
                  labelId="semester-filter-label"
                  id="semester-filter"
                  name="semester"
                  value={filters.semester?.toString() || ''}
                  label="Semester"
                  onChange={handleFilterChange}
                  displayEmpty
                  notched
                >
                  <MenuItem value=""><em>All Semesters</em></MenuItem>
                  <MenuItem value="1">Semester 1</MenuItem>
                  <MenuItem value="2">Semester 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="type-filter-label" shrink>Group Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  name="type"
                  value={filters.type || ''}
                  label="Group Type"
                  onChange={handleFilterChange}
                  displayEmpty
                  notched
                >
                  <MenuItem value=""><em>All Types</em></MenuItem>
                  <MenuItem value="weekday">Weekday</MenuItem>
                  <MenuItem value="weekend">Weekend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {Object.keys(filters).length > 0 
                ? 'No groups match the selected filters' 
                : 'No groups found. Add your first group using the button above.'}
            </Typography>
          </Box>
        ) : (
          <GroupList
            groups={groups}
            onEdit={handleOpenForm}
            onManageStudents={handleOpenStudentAssignment}
            onRefresh={fetchGroups}
          />
        )}
      </Paper>

      <GroupForm
        open={openForm}
        onClose={handleCloseForm}
        group={currentGroup || undefined}
        onSuccess={handleFormSuccess}
      />

      {currentGroup && (
        <StudentManagement
          open={openStudentAssignment}
          onClose={handleCloseStudentAssignment}
          group={currentGroup}
          onSuccess={handleStudentAssignmentSuccess}
        />
      )}
    </Container>
  );
};

export default Groups; 