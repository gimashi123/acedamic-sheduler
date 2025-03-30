import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Paper,
  TablePagination,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { Venue, deleteVenue } from '../../utils/api/venueApi';

interface VenueListProps {
  venues: Venue[];
  onEdit: (venue: Venue) => void;
  onRefresh: () => void;
}

const VenueList = ({ venues, onEdit, onRefresh }: VenueListProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDeleteDialog = (venue: Venue) => {
    setVenueToDelete(venue);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setVenueToDelete(null);
  };

  const handleDelete = async () => {
    if (!venueToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteVenue(venueToDelete._id);
      toast.success('Venue deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  };

  const getVenueTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'primary';
      case 'tutorial':
        return 'secondary';
      case 'lab':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      {venues.length === 0 ? (
        <Typography variant="subtitle1" align="center" sx={{ py: 3 }}>
          No venues found. Add your first venue using the button above.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hall Name</TableCell>
                  <TableCell>Building</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venues
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((venue) => (
                    <TableRow key={venue._id}>
                      <TableCell>{venue.hallName}</TableCell>
                      <TableCell>{venue.building}</TableCell>
                      <TableCell>
                        <Chip 
                          label={venue.type.charAt(0).toUpperCase() + venue.type.slice(1)} 
                          color={getVenueTypeColor(venue.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{venue.department}</TableCell>
                      <TableCell>{venue.faculty}</TableCell>
                      <TableCell>{venue.capacity}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          aria-label="edit" 
                          color="primary"
                          onClick={() => onEdit(venue)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          aria-label="delete" 
                          color="error"
                          onClick={() => openDeleteDialog(venue)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={venues.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the venue "{venueToDelete?.hallName}" in {venueToDelete?.building}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VenueList; 