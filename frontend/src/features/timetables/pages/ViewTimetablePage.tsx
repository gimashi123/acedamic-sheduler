import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Today as DateIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { getTimetableById } from '../timetableService';
import { ITimetable } from '../../../types/timetable';
import { toast } from 'react-hot-toast';

const ViewTimetablePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<ITimetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getTimetableById(id);
        setTimetable(data);
      } catch (error) {
        console.error('Error fetching timetable:', error);
        toast.error('Failed to load timetable details');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!timetable) {
    return (
      <Box p={3}>
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#FFF4F4', border: '1px solid #FFCDD2' }}>
          <Typography variant="h6" color="error">
            Timetable Not Found
          </Typography>
          <Typography variant="body1">
            The requested timetable could not be found. It may have been deleted or you may not have permission to view it.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/dashboard/timetable')}
            sx={{ mt: 2 }}
          >
            Back to Timetables
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton 
          onClick={() => navigate('/admin/dashboard/timetable')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {timetable.title}
        </Typography>
        <Chip
          label={timetable.isPublished ? 'Published' : 'Draft'}
          color={timetable.isPublished ? 'success' : 'default'}
          sx={{ ml: 2 }}
        />
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Details</Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/dashboard/timetable/edit/${timetable.id}`)}
          >
            Edit Timetable
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {timetable.description}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Group:</strong> {timetable.group}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <DateIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(timetable.createdAt || '').toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <TimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Last Updated:</strong> {new Date(timetable.updatedAt || '').toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Timetable Content
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box textAlign="center" py={5}>
          <Typography variant="body1" color="textSecondary" paragraph>
            No content has been added to this timetable yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/admin/dashboard/timetable/add/${timetable.id}`)}
          >
            Add Content
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewTimetablePage; 