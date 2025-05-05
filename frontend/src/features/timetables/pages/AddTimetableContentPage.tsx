import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getTimetableById } from '../timetableService';
import { ITimetable } from '../../../types/timetable';
import { toast } from 'react-hot-toast';

const AddTimetableContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<ITimetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(0);

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
            The requested timetable could not be found. It may have been deleted or you may not have permission to edit it.
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
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton 
          onClick={() => navigate('/admin/dashboard/timetable')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Add Content to {timetable.title}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={0} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Set up subjects</StepLabel>
          </Step>
          <Step>
            <StepLabel>Add schedule</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review and publish</StepLabel>
          </Step>
        </Stepper>

        <Alert 
          icon={<InfoIcon />} 
          severity="info" 
          sx={{ mb: 3 }}
        >
          This feature is currently under development. Please check back later for full functionality.
        </Alert>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Subjects" />
          <Tab label="Schedule" />
          <Tab label="Settings" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Subjects to Timetable
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Select the subjects you want to include in this timetable.
            </Typography>
            
            <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Card sx={{ width: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Subject selection will be available soon
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Schedule
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Arrange subjects into time slots for each day of the week.
            </Typography>
            
            <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Card sx={{ width: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Schedule builder will be available soon
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Timetable Settings
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Configure additional settings for this timetable.
            </Typography>
            
            <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Card sx={{ width: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Settings configuration will be available soon
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/admin/dashboard/timetable/view/${timetable.id}`)}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => {
              toast.success('Feature coming soon!');
            }}
          >
            Save Progress
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddTimetableContentPage; 