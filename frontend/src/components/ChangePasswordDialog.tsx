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
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { changePassword, error, loading, clearError, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState(defaultPassword || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Create a masked version of the current password for display
  const [maskedPassword] = useState('••••••••');

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

  return (
    <Dialog 
      open={open} 
      // Make dialog non-dismissible
      onClose={() => {}} // Empty function prevents closing
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>Change Your Password</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          For security reasons, you need to change your password before continuing.
          You cannot dismiss this dialog until you change your password.
        </DialogContentText>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully! Redirecting to login page...</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Current Password"
            type="password"
            // Display masked password but keep actual value in state
            value={maskedPassword}
            // Disable editing of current password
            disabled={true}
            InputProps={{
              readOnly: true,
            }}
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
            autoFocus
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
              <Button 
                onClick={handleSubmit} 
                color="primary" 
                variant="contained"
                disabled={loading}
                fullWidth
              >
                Change Password
              </Button>
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