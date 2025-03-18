import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

interface ChangePasswordDialogProps {
  open: boolean;
  defaultPassword?: string;
  onClose: () => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  defaultPassword,
  onClose,
}) => {
  const { changePassword, error, loading, clearError, logout, user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState(defaultPassword || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentPassword(defaultPassword || '');
      setNewPassword('');
      setConfirmPassword('');
      setLocalError(null);
      setSuccess(false);
      clearError();
    }
  }, [open, defaultPassword, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    setLocalError(null);
    
    // Validate passwords
    if (!currentPassword) {
      setLocalError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setLocalError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (currentPassword === newPassword) {
      setLocalError('New password must be different from the current password');
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error is handled by the auth context
      console.error('Failed to change password:', err);
    }
  };

  // Handle close based on whether password change is required
  const handleClose = () => {
    if (user?.passwordChangeRequired) {
      // Show warning but still allow closing
      setLocalError('Warning: You will need to change your password on next login.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={!!user?.passwordChangeRequired}
    >
      <DialogTitle>
        Change Your Password
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {user?.passwordChangeRequired 
            ? 'For security reasons, you need to change your password before continuing. You cannot dismiss this dialog until you change your password.'
            : 'Please enter your current password and choose a new password.'}
        </DialogContentText>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>
          Password changed successfully! A confirmation email has been sent to your email address. 
          Redirecting to login page...
        </Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading || success}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading || success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || success}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {loading ? (
          <CircularProgress size={24} sx={{ mr: 2 }} />
        ) : (
          <>
            {!success && (
              <>
                <Button 
                  onClick={handleClose} 
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  color="primary" 
                  variant="contained"
                  disabled={loading}
                  fullWidth={user?.passwordChangeRequired}
                >
                  Change Password
                </Button>
              </>
            )}
            {success && (
              <Button 
                color="primary" 
                variant="contained"
                disabled
                fullWidth
              >
                Redirecting...
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog; 