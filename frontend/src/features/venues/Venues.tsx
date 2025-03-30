import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Container
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { getAllVenues, Venue } from '../../utils/api/venueApi';
import VenueList from './VenueList';
import VenueForm from './VenueForm';
import useAuthStore from '../../store/authStore';

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const data = await getAllVenues();
      setVenues(data);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (venue: Venue | null = null) => {
    setCurrentVenue(venue);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setCurrentVenue(null);
    setOpenForm(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchVenues();
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" align="center">
            You don't have permission to access this page
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Venue Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Venue
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <VenueList
            venues={venues}
            onEdit={handleOpenForm}
            onRefresh={fetchVenues}
          />
        )}
      </Paper>

      <VenueForm
        open={openForm}
        onClose={handleCloseForm}
        venue={currentVenue}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default Venues; 