import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box, Chip } from '@mui/material';
import { Timetable, TimeSlot } from '../../types';

interface TimetableViewProps {
  timetable: Timetable;
}

const TimetableView: React.FC<TimetableViewProps> = ({ timetable }) => {
  // Group slots by day
  const slotsByDay = timetable.slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {});
  
  // Sort days in the correct order
  const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedDays = Object.keys(slotsByDay).sort(
    (a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b)
  );
  
  // Get all unique time slots
  const timeSlots = Array.from(
    new Set(
      timetable.slots.map(slot => `${slot.startTime}-${slot.endTime}`)
    )
  ).sort();
  
  // Find a slot for a specific day and time
  const findSlot = (day: string, timeSlot: string) => {
    const [startTime, endTime] = timeSlot.split('-');
    return slotsByDay[day]?.find(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );
  };
  
  // Render a cell with a subject
  const renderSubjectCell = (slot: TimeSlot) => {
    const subject = typeof slot.subject === 'string' 
      ? { name: 'Unknown', code: 'Unknown' } 
      : slot.subject;
      
    const venue = typeof slot.venue === 'string'
      ? { hallName: 'Unknown', building: 'Unknown' }
      : slot.venue;
      
    const lecturer = typeof slot.lecturer === 'string'
      ? { firstName: 'Unknown', lastName: 'Unknown' }
      : 'firstName' in slot.lecturer
        ? slot.lecturer
        : { firstName: 'Unknown', lastName: 'Unknown' };
    
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {subject.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {subject.code}
        </Typography>
        <Chip 
          size="small" 
          label={venue.hallName} 
          color="primary" 
          variant="outlined" 
          sx={{ mt: 1, mr: 1 }}
        />
        <Typography variant="body2" mt={1}>
          {lecturer.firstName} {lecturer.lastName}
        </Typography>
      </Box>
    );
  };
  
  return (
    <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell width={120}>Time Slot</TableCell>
            {sortedDays.map(day => (
              <TableCell key={day} align="center">
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map(timeSlot => (
            <TableRow key={timeSlot}>
              <TableCell component="th" scope="row">
                {timeSlot.replace('-', ' - ')}
              </TableCell>
              {sortedDays.map(day => {
                const slot = findSlot(day, timeSlot);
                return (
                  <TableCell key={`${day}-${timeSlot}`} align="center" sx={{ height: 150, minWidth: 200 }}>
                    {slot ? renderSubjectCell(slot) : ''}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimetableView; 