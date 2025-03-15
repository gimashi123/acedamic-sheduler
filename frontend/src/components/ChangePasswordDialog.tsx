import React, { useState } from 'react';
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
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

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
  const { changePassword, error, loading, clearError } = useAuth();
  const [currentPassword, setCurrentPassword] = useState(defaultPassword || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      
      // Close the dialog after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      // Error is handled by the auth context
      console.error('Failed to change password:', err);
    }
  };

  return (
    <Dialog open={open} onClose={success ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>Change Your Password</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          For security reasons, you need to change your password before continuing.
        </DialogContentText>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully!</Alert>}
        
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
              <Button 
                onClick={handleSubmit} 
                color="primary" 
                variant="contained"
                disabled={loading}
              >
                Change Password
              </Button>
            )}
            {success && (
              <Button 
                onClick={onClose} 
                color="primary" 
                variant="contained"
              >
                Continue
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog; 