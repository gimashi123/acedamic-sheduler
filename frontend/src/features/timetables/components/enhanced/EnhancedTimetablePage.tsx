import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  CircularProgress,
  Paper,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { useTimetable } from '../../../../contexts/TimetableContext';
import { AddTimeTableDetailsDialog } from './AddTimeTableDetailsDialog';
import { TimetableCard } from './TimetableCard';
import { CalendarMonth } from '@mui/icons-material';

export const EnhancedTimetablePage: React.FC = () => {
  const { timetables, loading, error } = useTimetable();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, m: 2, backgroundColor: '#FFF4F4', border: '1px solid #FFCDD2' }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Timetables</AlertTitle>
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <CalendarMonth fontSize="large" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Timetable Management
          </Typography>
        </Box>
        <AddTimeTableDetailsDialog />
      </Box>

      {timetables.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#F5F5F5' }}>
          <CalendarMonth sx={{ fontSize: 60, color: '#9E9E9E', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Timetables Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Get started by creating your first timetable
          </Typography>
          <AddTimeTableDetailsDialog />
        </Paper>
      ) : (
        <>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {timetables.map((timetable) => (
              <Grid item xs={12} sm={6} md={4} key={timetable.id}>
                <TimetableCard timetable={timetable} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};