import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { requestService } from './requestService';
import { UserRequest } from '../../types/request';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Requests: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Function to fetch pending requests
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await requestService.getPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending requests on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Handle approval of a request
  const handleApprove = async (requestId: string) => {
    setIsApproving(true);
    try {
      await requestService.approveRequest(requestId);
      toast.success('Request approved successfully');
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle rejection of a request
  const handleReject = async (requestId: string) => {
    setIsRejecting(true);
    try {
      await requestService.rejectRequest(requestId);
      toast.success('Request rejected successfully');
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!pendingRequests?.length) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="textSecondary">
          No pending requests found
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchPendingRequests}
          sx={{ mt: 2 }}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <div className="p-4">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Pending Registration Requests
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchPendingRequests}
        >
          Refresh
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Additional Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{`${request.firstName} ${request.lastName}`}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell className="capitalize">{request.role}</TableCell>
                <TableCell>{request.additionalDetails || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={request.status}
                    color={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(request._id)}
                      disabled={isApproving || request.status !== 'Pending'}
                      sx={{ mr: 1 }}
                    >
                      {isApproving ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(request._id)}
                      disabled={isRejecting || request.status !== 'Pending'}
                    >
                      {isRejecting ? <CircularProgress size={24} /> : 'Reject'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Requests; 