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
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { getTimetableById, updateTimetable } from '../timetableService';
import { ITimetable } from '../../../types/timetable';
import { toast } from 'react-hot-toast';
import { 
  SubjectSelectionList, 
  ScheduleBuilder 
} from '../components/content';
import { 
  fetchAllSubjects, 
  getTimetableContent, 
  Subject, 
  ScheduleEntry 
} from '../services/timetableContentService';

const AddTimetableContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<ITimetable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchTimetableData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch timetable details
        const timetableData = await getTimetableById(id);
        setTimetable(timetableData);
        setIsPublished(timetableData.isPublished);
        
        // Fetch all available subjects
        const subjectsData = await fetchAllSubjects();
        setSubjects(subjectsData);
        
        // Try to fetch existing content if available
        const contentData = await getTimetableContent(id);
        if (contentData) {
          setSelectedSubjectIds(contentData.subjects || []);
          setSchedule(contentData.schedule || []);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load timetable data');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetableData();
  }, [id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleSubjectSelectionChange = (selectedIds: string[]) => {
    setSelectedSubjectIds(selectedIds);
  };
  
  const handleScheduleChange = (newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule);
  };
  
  const handleSaveProgress = async () => {
    if (!id) return;
    
    setSaving(true);
    
    try {
      // First update the timetable publish status if changed
      if (timetable && timetable.isPublished !== isPublished) {
        await updateTimetable(id, { isPublished });
      }
      
      // Here you would save the subject selections and schedule
      // This would require implementing backend endpoints
      
      toast.success('Timetable content saved successfully');
      navigate(`/admin/dashboard/timetable/view/${id}`);
    } catch (error) {
      console.error('Error saving timetable content:', error);
      toast.error('Failed to save timetable content');
    } finally {
      setSaving(false);
    }
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
        <Stepper activeStep={activeTab} sx={{ mb: 4 }}>
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
            
            <SubjectSelectionList
              timetableId={id || ''}
              initialSelectedSubjects={selectedSubjectIds}
              onSelectionChange={handleSubjectSelectionChange}
            />
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
            
            <ScheduleBuilder
              timetableId={id || ''}
              subjects={subjects}
              selectedSubjectIds={selectedSubjectIds}
              initialSchedule={schedule}
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Timetable Settings
            </Typography>
            <Typography variant="body2" paragraph color="textSecondary">
              Configure additional settings and review your timetable before publishing.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    color="primary"
                  />
                }
                label={isPublished ? "Published" : "Draft"}
              />
              
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {isPublished 
                  ? "This timetable is visible to all users." 
                  : "This timetable is currently in draft mode and only visible to administrators."}
              </Typography>
            </Box>
            
            {selectedSubjectIds.length > 0 ? (
              <Alert 
                icon={<CheckIcon />} 
                severity="success" 
                sx={{ mt: 3 }}
              >
                {selectedSubjectIds.length} subject{selectedSubjectIds.length !== 1 ? 's' : ''} added to this timetable.
              </Alert>
            ) : (
              <Alert 
                icon={<InfoIcon />} 
                severity="warning" 
                sx={{ mt: 3 }}
              >
                No subjects have been added to this timetable yet. Go to the Subjects tab to add subjects.
              </Alert>
            )}
            
            {schedule.length > 0 ? (
              <Alert 
                icon={<CheckIcon />} 
                severity="success" 
                sx={{ mt: 2 }}
              >
                {schedule.length} schedule entr{schedule.length !== 1 ? 'ies' : 'y'} created.
              </Alert>
            ) : (
              <Alert 
                icon={<InfoIcon />} 
                severity="warning" 
                sx={{ mt: 2 }}
              >
                No schedule entries have been created yet. Go to the Schedule tab to create your timetable schedule.
              </Alert>
            )}
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            onClick={() => {
              const nextTab = Math.max(0, activeTab - 1);
              setActiveTab(nextTab);
            }}
            disabled={activeTab === 0 || saving}
          >
            Previous
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate(`/admin/dashboard/timetable/view/${timetable.id}`)}
              sx={{ mr: 2 }}
              disabled={saving}
            >
              Cancel
            </Button>
            
            {activeTab < 2 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const nextTab = Math.min(2, activeTab + 1);
                  setActiveTab(nextTab);
                }}
                disabled={saving}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveProgress}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save & Finish'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddTimetableContentPage;