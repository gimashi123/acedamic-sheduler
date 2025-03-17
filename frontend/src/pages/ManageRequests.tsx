import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequest } from '../context/RequestContext';
import { Role, UserRequest } from '../types';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Chip,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Tooltip,
  Snackbar,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
      style={{ minHeight: '400px' }}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `request-tab-${index}`,
    'aria-controls': `request-tabpanel-${index}`,
  };
}

const ManageRequests: React.FC = () => {
  const { user } = useAuth();
  const { getAllRequests, approveRequest, rejectRequest, loading, error, clearError } = useRequest();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<UserRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<UserRequest[]>([]);
  
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [approvedUserCredentials, setApprovedUserCredentials] = useState<{
    email: string;
    defaultPassword?: string;
  }>({ email: '' });
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== Role.ADMIN) {
      navigate('/unauthorized');
      return;
    }

    // Fetch all requests
    fetchRequests();
  }, [user, navigate]);

  useEffect(() => {
    // Filter requests by status
    const pending = requests.filter(req => req.status.toLowerCase() === 'pending');
    const approved = requests.filter(req => req.status.toLowerCase() === 'approved');
    const rejected = requests.filter(req => req.status.toLowerCase() === 'rejected');
    
    setPendingRequests(pending);
    setApprovedRequests(approved);
    setRejectedRequests(rejected);
  }, [requests]);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const data = await getAllRequests();
      // Map the data to ensure each request has an id field
      const mappedData = data.map(request => ({
        ...request,
        id: request.id || request._id || ''
      }));
      setRequests(mappedData as UserRequest[]);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproveClick = (request: UserRequest) => {
    setSelectedRequest(request);
    setOpenApproveDialog(true);
  };

  const handleRejectClick = (request: UserRequest) => {
    setSelectedRequest(request);
    setOpenRejectDialog(true);
    setRejectionReason('');
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;

    try {
      clearError(); // Clear any existing errors first
      setLocalError(null);
      const result = await approveRequest(selectedRequest.id);
      
      if (result.defaultPassword) {
        // Store the credentials for the dialog
        setApprovedUserCredentials({
          email: selectedRequest.email,
          defaultPassword: result.defaultPassword
        });
        
        // Show the credentials dialog
        setOpenCredentialsDialog(true);
      }
      
      setActionSuccess(`Request for ${selectedRequest.email} has been approved and an account has been created. (Email notification may or may not have been sent.)`);
      setOpenApproveDialog(false);
      // Refresh the requests list
      fetchRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 5000);
    } catch (err: any) {
      console.error('Error approving request:', err);
      setLocalError(err.message || 'An error occurred while approving the request');
      setActionSuccess('');
      setOpenApproveDialog(false);
      
      // Clear local error after 5 seconds
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
      
      // Still refresh the list anyway in case the operation partially succeeded
      fetchRequests();
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    try {
      clearError(); // Clear any existing errors first
      setLocalError(null);
      await rejectRequest(selectedRequest.id, rejectionReason);
      setActionSuccess(`Request for ${selectedRequest.email} has been rejected. (Email notification may or may not have been sent.)`);
      setOpenRejectDialog(false);
      // Refresh the requests list
      fetchRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setActionSuccess('');
      }, 5000);
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setLocalError(err.message || 'An error occurred while rejecting the request');
      setActionSuccess('');
      setOpenRejectDialog(false);
      
      // Clear local error after 5 seconds
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
      
      // Still refresh the list anyway in case the operation partially succeeded
      fetchRequests();
    }
  };

  const handleCopyCredentials = () => {
    if (approvedUserCredentials.defaultPassword) {
      const credentials = `Username: ${approvedUserCredentials.email}\nPassword: ${approvedUserCredentials.defaultPassword}`;
      navigator.clipboard.writeText(credentials);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Chip label="Pending" color="warning" sx={{ fontWeight: 'medium' }} />;
      case 'approved':
        return <Chip label="Approved" color="success" sx={{ fontWeight: 'medium' }} />;
      case 'rejected':
        return <Chip label="Rejected" color="error" sx={{ fontWeight: 'medium' }} />;
      default:
        return <Chip label={status} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestTable = (requestsToShow: UserRequest[]) => {
    if (requestsToShow.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No requests found.</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }} aria-label="requests table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requestsToShow.map((request) => (
              <TableRow 
                key={request.id}
                sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {request.firstName} {request.lastName}
                  </Typography>
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={request.role} 
                    size="small" 
                    color={request.role === Role.LECTURER ? "primary" : "default"} 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>
                  {request.status.toLowerCase() === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleApproveClick(request)}
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleRejectClick(request)}
                        >
                          <CancelOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {request.status.toLowerCase() !== 'pending' && (
                    <Typography variant="caption" color="text.secondary">
                      No actions available
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderRequestCards = (requestsToShow: UserRequest[]) => {
    if (requestsToShow.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No requests found.</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {requestsToShow.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      {request.firstName} {request.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Typography variant="body2">
                      <Chip 
                        label={request.role} 
                        size="small" 
                        color={request.role === Role.LECTURER ? "primary" : "default"} 
                        variant="outlined" 
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">{getStatusChip(request.status)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography variant="body2">{formatDate(request.createdAt)}</Typography>
                  </Grid>
                  {request.status.toLowerCase() === 'pending' && (
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApproveClick(request)}
                        sx={{ mr: 1 }}
                        startIcon={<CheckCircleOutlineIcon />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRejectClick(request)}
                        startIcon={<CancelOutlinedIcon />}
                      >
                        Reject
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (!user || user.role !== Role.ADMIN) {
    return null; // This will be handled by the useEffect redirect
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Manage Registration Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and manage registration requests from users
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Refresh requests">
              <IconButton 
                onClick={fetchRequests} 
                disabled={refreshing || loading}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {localError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError}
          </Alert>
        )}

        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {actionSuccess}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="request tabs"
                variant={isMobile ? "fullWidth" : "standard"}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="button">Pending</Typography>
                      <Chip 
                        label={pendingRequests.length} 
                        size="small" 
                        color="warning" 
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    </Box>
                  } 
                  {...a11yProps(0)} 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="button">Approved</Typography>
                      <Chip 
                        label={approvedRequests.length} 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    </Box>
                  } 
                  {...a11yProps(1)} 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="button">Rejected</Typography>
                      <Chip 
                        label={rejectedRequests.length} 
                        size="small" 
                        color="error" 
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    </Box>
                  } 
                  {...a11yProps(2)} 
                />
              </Tabs>
            </Box>
            
            <Box sx={{ p: 2 }}>
              <TabPanel value={tabValue} index={0}>
                {isMobile 
                  ? renderRequestCards(pendingRequests)
                  : renderRequestTable(pendingRequests)
                }
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {isMobile 
                  ? renderRequestCards(approvedRequests)
                  : renderRequestTable(approvedRequests)
                }
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {isMobile 
                  ? renderRequestCards(rejectedRequests)
                  : renderRequestTable(rejectedRequests)
                }
              </TabPanel>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Registration Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve the registration request for{' '}
            <strong>{selectedRequest?.email}</strong>? This will create a new user account.
            <br /><br />
            <Typography variant="body2" color="warning.main">
              Note: The system will attempt to send an email notification with login credentials, but this might fail if email settings are not properly configured. You might need to inform the user manually with their credentials.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenApproveDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleApproveConfirm} 
            color="success" 
            variant="contained"
            startIcon={<CheckCircleOutlineIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Registration Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to reject the registration request for{' '}
            <strong>{selectedRequest?.email}</strong>?
            <br /><br />
            <Typography variant="body2" color="warning.main">
              Note: The system will attempt to send a rejection notification email, but this might fail if email settings are not properly configured.
            </Typography>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for rejection (optional)"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenRejectDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            variant="contained"
            startIcon={<CancelOutlinedIcon />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog
        open={openCredentialsDialog}
        onClose={() => setOpenCredentialsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Account Created</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            An account has been created for <strong>{approvedUserCredentials.email}</strong>. 
            The system attempted to send an email with login credentials, but in case the email was not delivered, 
            please provide the following credentials to the user:
          </DialogContentText>
          
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Username:</Typography>
                  <Typography variant="body1">{approvedUserCredentials.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Password:</Typography>
                  <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                    {approvedUserCredentials.defaultPassword}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Typography variant="body2" color="text.secondary">
            The user will be required to change their password on first login.
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyCredentials}
            sx={{ mt: 2 }}
            fullWidth
          >
            Copy Credentials
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenCredentialsDialog(false)} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Credentials copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ManageRequests; 