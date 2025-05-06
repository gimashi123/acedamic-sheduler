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
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchAllSubjects } from '../services/timetableContentService';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  lecturer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface SubjectSelectionListProps {
  selectedSubjects: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const SubjectSelectionList: React.FC<SubjectSelectionListProps> = ({
  selectedSubjects,
  onSelectionChange
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const data = await fetchAllSubjects();
        setSubjects(data);
        setError(null);
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const handleToggleSubject = (id: string) => {
    const newSelectedSubjects = selectedSubjects.includes(id)
      ? selectedSubjects.filter(subjectId => subjectId !== id)
      : [...selectedSubjects, id];
    
    onSelectionChange(newSelectedSubjects);
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined">
      <Box p={2}>
        <TextField
          fullWidth
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
          sx={{ mb: 2 }}
        />

        {filteredSubjects.length === 0 ? (
          <Typography color="textSecondary" align="center" py={4}>
            No subjects found matching your search.
          </Typography>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
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
        
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </Typography>
      </Box>
    </Paper>
  );
};

export default SubjectSelectionList;