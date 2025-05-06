import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addScheduleEntry } from '../services/timetableContentService';
import { toast } from 'react-hot-toast';

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

interface ScheduleEntry {
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  venue?: string;
}

interface ScheduleBuilderProps {
  timetableId: string;
  subjects: Subject[];
  selectedSubjects: string[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM to 7PM

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ 
  timetableId,
  subjects,
  selectedSubjects 
}) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<ScheduleEntry>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Filter subjects to only those selected
  const availableSubjects = subjects.filter(subject => 
    selectedSubjects.includes(subject.id)
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setCurrentEntry({});
    setStartTime(null);
    setEndTime(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setCurrentEntry({
      ...currentEntry,
      [field]: value
    });
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.subjectId || !currentEntry.day || !startTime || !endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const formattedStartTime = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const formattedEndTime = endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const newEntry: ScheduleEntry = {
      subjectId: currentEntry.subjectId as string,
      day: currentEntry.day as string,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      venue: currentEntry.venue
    };

    try {
      // In a real implementation, we would save this to the backend
      // await addScheduleEntry(timetableId, newEntry);
      
      // For now, just update the local state
      setSchedule([...schedule, newEntry]);
      toast.success('Schedule entry added successfully');
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to add schedule entry');
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : 'Unknown Subject';
  };

  const getScheduleForTimeAndDay = (time: number, day: string) => {
    return schedule.find(entry => {
      const startHour = parseInt(entry.startTime.split(':')[0]);
      const endHour = parseInt(entry.endTime.split(':')[0]);
      return entry.day === day && time >= startHour && time < endHour;
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Weekly Schedule</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog}
          disabled={availableSubjects.length === 0}
        >
          Add Schedule Entry
        </Button>
      </Box>

      {availableSubjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#F5F5F5' }}>
          <Typography color="textSecondary">
            Please select subjects from the Subjects tab before creating a schedule.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="100px" align="center">Time</TableCell>
                {DAYS_OF_WEEK.map(day => (
                  <TableCell key={day} align="center">{day}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map(timeSlot => (
                <TableRow key={timeSlot}>
                  <TableCell align="center">{`${timeSlot}:00`}</TableCell>
                  {DAYS_OF_WEEK.map(day => {
                    const entry = getScheduleForTimeAndDay(timeSlot, day);
                    return (
                      <TableCell 
                        key={`${timeSlot}-${day}`} 
                        align="center"
                        sx={{
                          backgroundColor: entry ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                          borderLeft: entry ? '4px solid #1976d2' : 'none',
                          p: 1
                        }}
                      >
                        {entry && timeSlot === parseInt(entry.startTime.split(':')[0]) && (
                          <Box>
                            <Typography variant="subtitle2">
                              {getSubjectName(entry.subjectId)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {`${entry.startTime} - ${entry.endTime}`}
                            </Typography>
                            {entry.venue && (
                              <Chip 
                                label={entry.venue} 
                                size="small" 
                                sx={{ mt: 0.5 }} 
                              />
                            )}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Schedule Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                value={currentEntry.subjectId || ''}
                label="Subject"
                onChange={(e) => handleInputChange('subjectId', e.target.value)}
              >
                {availableSubjects.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="day-select-label">Day</InputLabel>
              <Select
                labelId="day-select-label"
                value={currentEntry.day || ''}
                label="Day"
                onChange={(e) => handleInputChange('day', e.target.value)}
              >
                {DAYS_OF_WEEK.map(day => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  viewRenderers={{
                    hours: null,
                    minutes: null,
                  }}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  viewRenderers={{
                    hours: null,
                    minutes: null,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Venue (Optional)"
              value={currentEntry.venue || ''}
              onChange={(e) => handleInputChange('venue', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveEntry} variant="contained" color="primary">
            Add to Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleBuilder;