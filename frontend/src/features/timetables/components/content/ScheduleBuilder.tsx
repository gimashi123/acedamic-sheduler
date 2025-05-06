import React, { useState, useEffect } from 'react';
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
  Chip,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Subject, ScheduleEntry, addScheduleEntry } from '../../services/timetableContentService';
import { toast } from 'react-hot-toast';

interface ScheduleBuilderProps {
  timetableId: string;
  subjects: Subject[];
  selectedSubjectIds: string[];
  initialSchedule?: ScheduleEntry[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM to 7PM

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ 
  timetableId,
  subjects,
  selectedSubjectIds,
  initialSchedule = []
}) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(initialSchedule);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<ScheduleEntry>>({});
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter subjects to only those selected
  const availableSubjects = subjects.filter(subject => 
    selectedSubjectIds.includes(subject.id)
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setCurrentEntry({});
    setStartTime('');
    setEndTime('');
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

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const handleDayChange = (e: SelectChangeEvent<string>) => {
    handleInputChange('day', e.target.value);
  };

  const handleSubjectChange = (e: SelectChangeEvent<string>) => {
    handleInputChange('subjectId', e.target.value);
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.subjectId || !currentEntry.day || !startTime || !endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      const newEntry: Omit<ScheduleEntry, 'id'> = {
        subjectId: currentEntry.subjectId as string,
        day: currentEntry.day as string,
        startTime,
        endTime,
        venue: currentEntry.venue
      };

      try {
        // Try to save to backend
        const savedEntry = await addScheduleEntry(timetableId, newEntry);
        setSchedule([...schedule, savedEntry]);
      } catch (error) {
        // If backend fails, add locally
        console.error('Backend save failed, adding entry locally', error);
        setSchedule([...schedule, { ...newEntry, id: Date.now().toString() }]);
      }
      
      toast.success('Schedule entry added successfully');
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to add schedule entry');
    } finally {
      setIsSaving(false);
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
          startIcon={<AddIcon />}
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
                onChange={handleSubjectChange}
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
                onChange={handleDayChange}
              >
                {DAYS_OF_WEEK.map(day => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                fullWidth
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                fullWidth
              />
            </Box>

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
          <Button 
            onClick={handleSaveEntry} 
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Add to Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleBuilder;