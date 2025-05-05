import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import { ITimetable } from '../../../../types/timetable';
import { useNavigate } from 'react-router-dom';
import { DeleteTimetableDialog } from './DeleteTimetableDialog';
import { UpdateTimeTableDetailsDialog } from './UpdateTimeTableDetailsDialog';
import { CalendarMonth, Visibility, Edit, Add } from '@mui/icons-material';

interface TimetableCardProps {
  timetable: ITimetable;
}

export const TimetableCard: React.FC<TimetableCardProps> = ({ timetable }) => {
  const navigate = useNavigate();

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {timetable.title}
          </Typography>
          <Chip 
            label={timetable.isPublished ? 'Published' : 'Draft'} 
            color={timetable.isPublished ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '60px'
          }}
        >
          {timetable.description}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" alignItems="center" mt={1}>
          <CalendarMonth fontSize="small" color="primary" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="primary">
            Group: {timetable.group}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Box>
          <Tooltip title="View Timetable">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/admin/dashboard/timetable/view/${timetable.id}`)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Content">
            <IconButton
              size="small"
              color="success"
              onClick={() => navigate(`/admin/dashboard/timetable/add/${timetable.id}`)}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <UpdateTimeTableDetailsDialog timetable={timetable} />
          <DeleteTimetableDialog timetable={timetable} />
        </Box>
      </CardActions>
    </Card>
  );
};