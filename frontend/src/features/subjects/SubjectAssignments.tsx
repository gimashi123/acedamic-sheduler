import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import toast from 'react-hot-toast';

import { 
  getAllSubjectAssignments, 
  getCurrentAssignments, 
  getAvailableLecturers,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  checkAndCleanupAssignments,
  type SubjectAssignment,
  type Lecturer
} from '../../utils/api/subjectAssignmentApi';
import useAuthStore from '../../store/authStore';

// Subject API import
import { getAllSubjects, Subject } from '../../utils/api/subjectApi';

const SubjectAssignments: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  
  // States
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableLecturers, setAvailableLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<SubjectAssignment | null>(null);
  
  // Current year and semester for filtering
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = new Date().getMonth() + 1;
  const currentSemester = currentMonth >= 8 || currentMonth <= 1 ? 1 : 2;
  
  // Form data state
  const [formData, setFormData] = useState({
    subjectId: '',
    lecturerId: '',
    academicYear: currentYear,
    semester: currentSemester,
    notes: ''
  });
  
  // Add filter states
  const [filters, setFilters] = useState({
    academicYear: '',
    semester: ''
  });
  
  // Fetch assignments and subjects on load
  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);
  
  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // First check and clean up invalid assignments if needed
      try {
        await checkAndCleanupAssignments();
      } catch (cleanupError) {
        console.error('Error during cleanup (continuing anyway):', cleanupError);
      }
      
      console.log('Fetching all subject assignments...');
      const data = await getAllSubjectAssignments();
      console.log('DEBUG - Assignments from API:', data);
      
      // Ensure all assignments have valid subject data
      const validatedData = data.map(assignment => {
        // If subject exists but moduleCode is missing
        if (assignment.subject && !assignment.subject.moduleCode) {
          console.log('Fixing missing moduleCode for assignment:', assignment._id);
          return {
            ...assignment,
            subject: {
              ...assignment.subject,
              moduleCode: 'CODE-' + assignment.subject._id.substring(0, 5)
            }
          };
        }
        return assignment;
      });
      
      // Log each assignment's subject properties
      if (validatedData.length > 0) {
        validatedData.forEach((assignment, index) => {
          console.log(`Assignment ${index} subject:`, assignment.subject);
          console.log(`Assignment ${index} subject moduleCode:`, assignment.subject?.moduleCode);
          console.log(`Assignment ${index} subject properties:`, Object.keys(assignment.subject));
        });
      }
      
      setAssignments(validatedData);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      // Check if the error was a network error (likely server not running)
      if (error.message && error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Is the backend running?');
      } else {
        toast.error('Failed to load subject assignments');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };
  
  // Fetch available lecturers for a subject
  const fetchAvailableLecturers = async (subjectId: string) => {
    if (!subjectId) return;
    try {
      const data = await getAvailableLecturers(
        subjectId, 
        formData.academicYear, 
        formData.semester
      );
      setAvailableLecturers(data);
    } catch (error) {
      console.error('Error fetching available lecturers:', error);
      toast.error('Failed to load available lecturers');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If subject changes, fetch available lecturers
    if (name === 'subjectId' && value) {
      fetchAvailableLecturers(value);
    }
    
    // If semester or year changes, also update available lecturers if a subject is selected
    if (['semester', 'academicYear'].includes(name) && formData.subjectId) {
      fetchAvailableLecturers(formData.subjectId);
    }
  };
  
  // Open form to add new assignment
  const handleOpenAddForm = () => {
    setCurrentAssignment(null);
    setFormData({
      subjectId: '',
      lecturerId: '',
      academicYear: currentYear,
      semester: currentSemester,
      notes: ''
    });
    setAvailableLecturers([]);
    setOpenForm(true);
  };
  
  // Open form to edit assignment
  const handleOpenEditForm = (assignment: SubjectAssignment) => {
    setCurrentAssignment(assignment);
    setFormData({
      subjectId: assignment.subject._id,
      lecturerId: assignment.lecturer._id,
      academicYear: assignment.academicYear,
      semester: assignment.semester,
      notes: assignment.notes || ''
    });
    
    // For editing, we need to fetch all lecturers
    const fetchLecturersForEdit = async () => {
      try {
        // Get all lecturers from API
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/lecturers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch lecturers');
        }
        
        const data = await response.json();
        const lecturers = data.data;
        
        // Ensure current lecturer is in the list
        if (!lecturers.some((l: { _id: string }) => l._id === assignment.lecturer._id)) {
          lecturers.push({
            _id: assignment.lecturer._id,
            firstName: assignment.lecturer.firstName,
            lastName: assignment.lecturer.lastName,
            email: assignment.lecturer.email
          });
        }
        
        setAvailableLecturers(lecturers);
      } catch (error) {
        console.error('Error fetching lecturers for edit:', error);
        // At minimum, ensure current lecturer is available
        setAvailableLecturers([{
          _id: assignment.lecturer._id,
          firstName: assignment.lecturer.firstName,
          lastName: assignment.lecturer.lastName,
          email: assignment.lecturer.email
        }]);
      }
    };
    
    fetchLecturersForEdit();
    setOpenForm(true);
  };
  
  // Open delete confirmation dialog
  const handleOpenDelete = (assignment: SubjectAssignment) => {
    setCurrentAssignment(assignment);
    setOpenDelete(true);
  };
  
  // Close all dialogs
  const handleCloseDialogs = () => {
    setOpenForm(false);
    setOpenDelete(false);
    setCurrentAssignment(null);
  };
  
  // Submit form to create or update assignment
  const handleSubmit = async () => {
    if (!formData.subjectId || !formData.lecturerId) {
      toast.error('Subject and lecturer are required');
      return;
    }
    
    // Convert semester to a number to ensure consistent data type
    const semesterNumber = parseInt(formData.semester.toString(), 10);
    
    try {
      if (currentAssignment) {
        // Update existing assignment
        console.log('Updating assignment:', currentAssignment._id, {
          subjectId: formData.subjectId,
          lecturerId: formData.lecturerId,
          academicYear: formData.academicYear,
          semester: semesterNumber,
          notes: formData.notes
        });
        
        await updateAssignment(currentAssignment._id, {
          subjectId: formData.subjectId,
          lecturerId: formData.lecturerId,
          academicYear: formData.academicYear,
          semester: semesterNumber,
          notes: formData.notes
        });
        toast.success('Assignment updated successfully');
      } else {
        // Create new assignment
        console.log('Creating assignment:', {
          subjectId: formData.subjectId,
          lecturerId: formData.lecturerId,
          academicYear: formData.academicYear,
          semester: semesterNumber,
          notes: formData.notes
        });
        
        await createAssignment({
          subjectId: formData.subjectId,
          lecturerId: formData.lecturerId,
          academicYear: formData.academicYear,
          semester: semesterNumber,
          notes: formData.notes
        });
        toast.success('Subject assigned to lecturer successfully');
      }
      
      // Refresh assignments and close dialog
      handleCloseDialogs();
      fetchAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    }
  };
  
  // Delete assignment
  const handleDelete = async () => {
    if (!currentAssignment) return;
    
    try {
      await deleteAssignment(currentAssignment._id);
      toast.success('Assignment deleted successfully');
      
      // Refresh assignments and close dialog
      handleCloseDialogs();
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      academicYear: '',
      semester: ''
    });
  };
  
  // Apply filters to assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filters.academicYear && assignment.academicYear !== filters.academicYear) {
      return false;
    }
    if (filters.semester && assignment.semester.toString() !== filters.semester) {
      return false;
    }
    return true;
  });
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subject Assignments
      </Typography>
      
      <Typography variant="body1" paragraph>
        Manage subject assignments to lecturers.
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 160 }} variant="outlined" size="small">
            <InputLabel id="filter-academic-year-label">Academic Year</InputLabel>
            <Select
              labelId="filter-academic-year-label"
              name="academicYear"
              value={filters.academicYear}
              onChange={handleFilterChange}
              label="Academic Year"
            >
              <MenuItem value="">
                <em>All Years</em>
              </MenuItem>
              {[...new Set(assignments.map(a => a.academicYear))].sort().map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 140 }} variant="outlined" size="small">
            <InputLabel id="filter-semester-label">Semester</InputLabel>
            <Select
              labelId="filter-semester-label"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              label="Semester"
            >
              <MenuItem value="">
                <em>All Semesters</em>
              </MenuItem>
              <MenuItem value="1">Semester 1</MenuItem>
              <MenuItem value="2">Semester 2</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
            size="small"
          >
            Reset Filters
          </Button>
        </Box>
        
        {isAdmin && (
          <Box sx={{ ml: 'auto' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpenAddForm}
            >
              Assign Subject
            </Button>
          </Box>
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAssignments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No subject assignments found</Typography>
          <Typography variant="body2" color="textSecondary">
            {isAdmin 
              ? 'Click "Assign Subject" to create a new assignment' 
              : 'There are no subjects assigned for the selected filters'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject Code</TableCell>
                <TableCell>Subject Name</TableCell>
                <TableCell>Lecturer</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Notes</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>
                    {assignment.subject?.moduleCode || 
                     (assignment.subject ? '[Missing Module Code]' : '[Subject Data Error]')}
                  </TableCell>
                  <TableCell>{assignment.subject?.name || '[Missing Subject Name]'}</TableCell>
                  <TableCell>
                    {`${assignment.lecturer?.firstName || ''} ${assignment.lecturer?.lastName || ''}`}
                  </TableCell>
                  <TableCell>{assignment.academicYear}</TableCell>
                  <TableCell>{assignment.semester}</TableCell>
                  <TableCell>{assignment.notes || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />} 
                        onClick={() => handleOpenEditForm(assignment)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />} 
                        onClick={() => handleOpenDelete(assignment)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Create/Edit Assignment Dialog */}
      <Dialog open={openForm} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentAssignment ? 'Edit Assignment' : 'Assign Subject to Lecturer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="subject-label" shrink={!!formData.subjectId}>Subject</InputLabel>
              <Select
                labelId="subject-label"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleSelectChange}
                label="Subject"
                notched
              >
                <MenuItem value="">
                  <em>Select a subject</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {`${subject.moduleCode} - ${subject.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="lecturer-label" shrink={!!formData.lecturerId}>Lecturer</InputLabel>
              <Select
                labelId="lecturer-label"
                name="lecturerId"
                value={formData.lecturerId}
                onChange={handleSelectChange}
                label="Lecturer"
                disabled={!formData.subjectId}
                notched
              >
                <MenuItem value="">
                  <em>Select a lecturer</em>
                </MenuItem>
                {availableLecturers.map((lecturer) => (
                  <MenuItem key={lecturer._id} value={lecturer._id}>
                    {`${lecturer.firstName} ${lecturer.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="academic-year-label" shrink={!!formData.academicYear}>Academic Year</InputLabel>
              <Select
                labelId="academic-year-label"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleSelectChange}
                label="Academic Year"
                notched
              >
                {[(Number(currentYear) - 1), Number(currentYear), (Number(currentYear) + 1)].map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year.toString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="semester-label" shrink={!!formData.semester}>Semester</InputLabel>
              <Select
                labelId="semester-label"
                name="semester"
                value={formData.semester.toString()}
                onChange={handleSelectChange}
                label="Semester"
                notched
              >
                <MenuItem value="1">Semester 1</MenuItem>
                <MenuItem value="2">Semester 2</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {currentAssignment ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment of{' '}
            <strong>{currentAssignment?.subject.name}</strong> to{' '}
            <strong>
              {currentAssignment?.lecturer.firstName} {currentAssignment?.lecturer.lastName}
            </strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectAssignments; 