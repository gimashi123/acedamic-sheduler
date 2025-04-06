import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PictureAsPdf
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Group, Student, getAvailableStudents, addStudentsToGroup, removeStudentFromGroup } from '../../utils/api/groupApi';
import { exportToPdf } from '../../utils/pdfExport';

interface StudentManagementProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: Group;
}

const StudentManagement = ({ open, onClose, onSuccess, group }: StudentManagementProps) => {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState<string[]>([]);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Compute current students from the group
  const groupStudents = group.students || [];
  
  // Filter available students based on search term
  const filteredAvailableStudents = availableStudents.filter(student => 
    `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter group students based on search term
  const filteredGroupStudents = groupStudents.filter(student => 
    `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      fetchAvailableStudents();
    } else {
      // Clear selections when dialog closes
      setSelectedAvailableStudents([]);
      setSelectedGroupStudents([]);
      setSearchTerm('');
    }
  }, [open]);

  const fetchAvailableStudents = async () => {
    setIsLoading(true);
    try {
      const students = await getAvailableStudents();
      setAvailableStudents(students);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast.error('Failed to fetch available students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailableStudent = (studentId: string) => {
    setSelectedAvailableStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleToggleGroupStudent = (studentId: string) => {
    setSelectedGroupStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleAddStudents = async () => {
    if (selectedAvailableStudents.length === 0) return;
    
    // Check if adding would exceed the limit
    if (groupStudents.length + selectedAvailableStudents.length > 30) {
      toast.error(`Cannot add ${selectedAvailableStudents.length} students. Maximum group size is 30.`);
      return;
    }
    
    setIsLoading(true);
    try {
      await addStudentsToGroup(group._id, selectedAvailableStudents);
      toast.success(`Added ${selectedAvailableStudents.length} students to group`);
      // Refresh data
      onSuccess();
      // Clear selections
      setSelectedAvailableStudents([]);
      // Refetch available students
      fetchAvailableStudents();
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error('Failed to add students to group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudents = async () => {
    if (selectedGroupStudents.length === 0) return;
    
    setIsLoading(true);
    try {
      // We need to remove students one by one
      const removePromises = selectedGroupStudents.map(studentId =>
        removeStudentFromGroup(group._id, studentId)
      );
      
      await Promise.all(removePromises);
      
      toast.success(`Removed ${selectedGroupStudents.length} students from group`);
      // Refresh data
      onSuccess();
      // Clear selections
      setSelectedGroupStudents([]);
      // Refetch available students
      fetchAvailableStudents();
    } catch (error) {
      console.error('Error removing students:', error);
      toast.error('Failed to remove students from group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStudentsToPdf = () => {
    if (groupStudents.length === 0) {
      toast.error('No students to export');
      return;
    }

    const columns = [
      { header: 'First Name', dataKey: 'firstName' },
      { header: 'Last Name', dataKey: 'lastName' },
      { header: 'Email', dataKey: 'email' }
    ];

    exportToPdf({
      title: `Students in Group: ${group.name}`,
      filename: `group-${group.name}-students-${new Date().toISOString().split('T')[0]}`,
      columns,
      data: groupStudents,
      orientation: 'portrait',
      includeTimestamp: true
    });

    toast.success('Student list exported to PDF successfully');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="student-management-dialog-title"
    >
      <DialogTitle id="student-management-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Manage Students in Group: {group.name}
          </Typography>
          {groupStudents.length > 0 && (
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdf />} 
              onClick={handleExportStudentsToPdf}
              size="small"
            >
              Export Students PDF
            </Button>
          )}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          Faculty: {group.faculty} | Department: {group.department} | Type: {group.groupType.charAt(0).toUpperCase() + group.groupType.slice(1)}
        </Typography>
        <Typography variant="subtitle2" sx={{ 
          mt: 0.5, 
          color: groupStudents.length >= 30 ? 'error.main' : 'text.secondary',
          fontWeight: groupStudents.length >= 30 ? 'bold' : 'normal'
        }}>
          Students: {groupStudents.length}/30 
          {groupStudents.length >= 30 && ' (Maximum Reached)'}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Box>
        
        <Grid container spacing={2}>
          {/* Available Students Column */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              Available Students
              {selectedAvailableStudents.length > 0 && (
                <Chip 
                  label={`${selectedAvailableStudents.length} selected`}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : filteredAvailableStudents.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No available students found
              </Typography>
            ) : (
              <List sx={{ height: 400, overflow: 'auto', bgcolor: 'background.paper' }}>
                {filteredAvailableStudents.map((student) => (
                  <ListItem 
                    key={student._id}
                    button
                    selected={selectedAvailableStudents.includes(student._id)}
                    onClick={() => handleToggleAvailableStudent(student._id)}
                  >
                    <ListItemIcon>
                      <PersonAddIcon color={selectedAvailableStudents.includes(student._id) ? "primary" : "action"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={student.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
          
          {/* Action Buttons Column */}
          <Grid item xs={12} md={2}>
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              height="100%"
              gap={2}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowForwardIcon />}
                disabled={selectedAvailableStudents.length === 0 || isLoading}
                onClick={handleAddStudents}
              >
                Add
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                disabled={selectedGroupStudents.length === 0 || isLoading}
                onClick={handleRemoveStudents}
              >
                Remove
              </Button>
            </Box>
          </Grid>
          
          {/* Group Students Column */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              Students in Group
              {selectedGroupStudents.length > 0 && (
                <Chip 
                  label={`${selectedGroupStudents.length} selected`}
                  color="secondary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
              </Box>
            ) : filteredGroupStudents.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No students in this group
              </Typography>
            ) : (
              <List sx={{ height: 400, overflow: 'auto', bgcolor: 'background.paper' }}>
                {filteredGroupStudents.map((student) => (
                  <ListItem 
                    key={student._id}
                    button
                    selected={selectedGroupStudents.includes(student._id)}
                    onClick={() => handleToggleGroupStudent(student._id)}
                  >
                    <ListItemIcon>
                      <PersonRemoveIcon color={selectedGroupStudents.includes(student._id) ? "secondary" : "action"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${student.firstName} ${student.lastName}`}
                      secondary={student.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentManagement; 