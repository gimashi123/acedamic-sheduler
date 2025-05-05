import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useTimetable } from '../../../contexts/TimetableContext';
import AddTimetableDialog from '../components/AddTimetableDialog';
import UpdateTimetableDialog from '../components/UpdateTimetableDialog';
import DeleteTimetableDialog from '../components/DeleteTimetableDialog';
import { useNavigate } from 'react-router-dom';

const TimetablePage: React.FC = () => {
  const { timetables, loading, error } = useTimetable();
  const navigate = useNavigate();

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<{id: string, title: string} | null>(null);

  const handleAddTimetable = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditTimetable = (id: string, title: string) => {
    setSelectedTimetable({ id, title });
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteTimetable = (id: string, title: string) => {
    setSelectedTimetable({ id, title });
    setIsDeleteDialogOpen(true);
  };

  const handleViewTimetable = (id: string) => {
    navigate(`/admin/dashboard/timetable/view/${id}`);
  };

  const handleAddTimetableContent = (id: string) => {
    navigate(`/admin/dashboard/timetable/add/${id}`);
  };

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
        <Typography variant="h6" color="error">
          Error Loading Timetables
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Timetable Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddTimetable}
        >
          Add Timetable
        </Button>
      </Box>

      {timetables.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#F5F5F5' }}>
          <CalendarIcon sx={{ fontSize: 60, color: '#9E9E9E', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Timetables Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Get started by creating your first timetable
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleAddTimetable}
          >
            Add New Timetable
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {timetables.map((timetable) => (
            <Grid item xs={12} sm={6} md={4} key={timetable.id}>
              <Card 
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
                    <Typography variant="h6" component="h2" noWrap>
                      {timetable.title}
                    </Typography>
                    <Chip 
                      label={timetable.isPublished ? 'Published' : 'Draft'} 
                      size="small"
                      color={timetable.isPublished ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '60px'
                    }}
                  >
                    {timetable.description}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Group: {timetable.group}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                  <Box>
                    <Tooltip title="View Timetable">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewTimetable(timetable.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Content">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleAddTimetableContent(timetable.id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTimetable(timetable.id, timetable.title)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEditTimetable(timetable.id, timetable.title)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Timetable Dialog */}
      <AddTimetableDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
      />

      {/* Update Timetable Dialog */}
      <UpdateTimetableDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        timetableId={selectedTimetable?.id || null}
      />

      {/* Delete Timetable Dialog */}
      <DeleteTimetableDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        timetableId={selectedTimetable?.id || null}
        timetableTitle={selectedTimetable?.title || ''}
      />
    </Box>
  );
};

export default TimetablePage; 