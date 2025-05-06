import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  ListItemSecondaryAction,
  Divider,
  Button,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchAllSubjects, Subject, saveSubjectsToTimetable } from '../../services/timetableContentService';
import { toast } from 'react-hot-toast';

interface SubjectSelectionListProps {
  timetableId: string;
  initialSelectedSubjects?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const SubjectSelectionList: React.FC<SubjectSelectionListProps> = ({
  timetableId,
  initialSelectedSubjects = [],
  onSelectionChange
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSelectedSubjects);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const data = await fetchAllSubjects();
        setSubjects(data);
        setError(null);
      } catch (err: any) {
        console.error('Error loading subjects:', err);
        // Display a more specific error message from the service
        setError(err.message || 'Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Complete the retry function
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    
    const loadSubjects = async () => {
      try {
        const data = await fetchAllSubjects();
        setSubjects(data);
        setError(null);
      } catch (err: any) {
        console.error('Error reloading subjects:', err);
        setError(err.message || 'Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  };

  const handleToggleSubject = (id: string) => {
    const newSelectedSubjects = selectedSubjects.includes(id)
      ? selectedSubjects.filter(subjectId => subjectId !== id)
      : [...selectedSubjects, id];
    
    setSelectedSubjects(newSelectedSubjects);
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedSubjects);
    }
  };

  const handleSaveSelections = async () => {
    try {
      setSaving(true);
      await saveSubjectsToTimetable(timetableId, selectedSubjects);
      toast.success('Subjects saved to timetable successfully');
    } catch (error) {
      toast.error('Failed to save subject selections');
      console.error('Error saving subject selections:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      subject.name.toLowerCase().includes(lowerQuery) ||
      subject.code.toLowerCase().includes(lowerQuery)
    );
  });

  const getLecturerName = (lecturer: Subject['lecturer']) => {
    if (!lecturer) return 'Not assigned';
    return `${lecturer.firstName} ${lecturer.lastName}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined">
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            sx={{ flexGrow: 1, mr: 2 }}
            variant="outlined"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSelections}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Selection'}
          </Button>
        </Box>

        {filteredSubjects.length === 0 ? (
          <Typography color="textSecondary" align="center" py={4}>
            No subjects found matching your search.
          </Typography>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            {filteredSubjects.map((subject) => (
              <React.Fragment key={subject.id}>
                <ListItem button onClick={() => handleToggleSubject(subject.id)}>
                  <Checkbox
                    edge="start"
                    checked={selectedSubjects.includes(subject.id)}
                    tabIndex={-1}
                  />
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1">{subject.name}</Typography>
                        <Chip
                          label={subject.code}
                          size="small"
                          sx={{ ml: 1, fontFamily: 'monospace' }}
                        />
                      </Box>
                    }
                    secondary={`Lecturer: ${getLecturerName(subject.lecturer)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={`${subject.credits} credit${subject.credits > 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="caption" color="textSecondary">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SubjectSelectionList;