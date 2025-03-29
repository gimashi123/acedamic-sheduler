import React, { useState } from 'react';
import { User } from '../../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete, Image, Edit } from '@mui/icons-material';
import ProfilePicture from '../../components/ProfilePicture';
import { profileService } from '../../features/profile/profileService';
import { userService } from './userService';
import toast from 'react-hot-toast';

interface UserTableProps {
  users: User[];
  title: string;
  onRemoveUser: (userId: string, reason?: string) => void;
  onUserUpdated?: () => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
}

const UserTable: React.FC<UserTableProps> = ({ users, title, onRemoveUser, onUserUpdated }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [userForPicture, setUserForPicture] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleClickOpen = (user: User) => {
    setSelectedUser(user);
    setReason('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmRemove = () => {
    if (selectedUser) {
      onRemoveUser(selectedUser._id, reason);
      setOpen(false);
    }
  };

  const handleOpenPictureDialog = (user: User) => {
    setUserForPicture(user);
    setPictureDialogOpen(true);
  };

  const handleClosePictureDialog = () => {
    setPictureDialogOpen(false);
    setUserForPicture(null);
  };

  const handleProfileUpdate = async (profilePicture: any) => {
    if (onUserUpdated) {
      onUserUpdated();
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear previous error for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    
    // Validation for first name and last name (allow letters and numbers only)
    if ((name === 'firstName' || name === 'lastName') && value !== '') {
      const nameRegex = /^[A-Za-z0-9\s]+$/;
      if (!nameRegex.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          [name]: 'Only letters and numbers are allowed'
        }));
        return;
      }
    }
    
    // Email validation
    if (name === 'email' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFormErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    // Check if there are any errors
    const hasErrors = Object.values(formErrors).some(error => error !== '');
    
    // Check if required fields are filled
    const requiredFieldsFilled = 
      editFormData.firstName.trim() !== '' && 
      editFormData.lastName.trim() !== '' && 
      editFormData.email.trim() !== '';
      
    return !hasErrors && requiredFieldsFilled;
  };

  const handleSaveUserDetails = async () => {
    if (!editingUser) return;
    
    // Additional validation before submission
    let isValid = true;
    const newErrors = { firstName: '', lastName: '', email: '' };
    
    // Check for empty fields
    if (!editFormData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    if (!editFormData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    
    if (!editFormData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    if (!isValid) {
      setFormErrors(newErrors);
      return;
    }
    
    try {
      const updatedUser = await userService.updateUser(editingUser._id, editFormData);
      toast.success('User details updated successfully');
      handleCloseEditDialog();
      
      // Refresh the user list
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Handle backend validation errors
      if (error.response?.data?.error?.validationErrors) {
        const backendErrors = error.response.data.error.validationErrors;
        setFormErrors({
          firstName: backendErrors.firstName || '',
          lastName: backendErrors.lastName || '',
          email: backendErrors.email || ''
        });
      } else if (error.response?.data?.message) {
        // Handle general error message
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update user details');
      }
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No {title.toLowerCase()} found.</p>
      ) : (
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell width="80px">
                    <ProfilePicture 
                      profilePicture={user.profilePicture} 
                      size="small"
                      editable={false}
                    />
                  </TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Tooltip title="Manage profile picture">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenPictureDialog(user)}
                        >
                          <Image fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit user details">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleClickOpen(user)}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {selectedUser?.firstName} {selectedUser?.lastName}? 
            This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for removal (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Picture Dialog */}
      <Dialog open={pictureDialogOpen} onClose={handleClosePictureDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Profile Picture</DialogTitle>
        <DialogContent>
          <div className="flex flex-col items-center p-4">
            <h3 className="text-lg mb-4">{userForPicture?.firstName} {userForPicture?.lastName}</h3>
            {userForPicture && (
              <ProfilePicture 
                profilePicture={userForPicture.profilePicture} 
                size="large" 
                editable={true}
                userId={userForPicture._id}
                isAdmin={true}
                onUpdate={handleProfileUpdate}
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePictureDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Details</DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4 text-sm">
            You can edit the user's details below. Names can only contain letters and numbers.
          </DialogContentText>
          <div className="p-4">
            <TextField
              margin="dense"
              label="First Name"
              type="text"
              fullWidth
              name="firstName"
              value={editFormData.firstName}
              onChange={handleEditFormChange}
              variant="outlined"
              className="mb-4"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName || "Letters and numbers only"}
              required
              InputProps={{
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
              }}
            />
            <TextField
              margin="dense"
              label="Last Name"
              type="text"
              fullWidth
              name="lastName"
              value={editFormData.lastName}
              onChange={handleEditFormChange}
              variant="outlined"
              className="mb-4"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName || "Letters and numbers only"}
              required
              InputProps={{
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
              }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              name="email"
              value={editFormData.email}
              onChange={handleEditFormChange}
              variant="outlined"
              error={!!formErrors.email}
              helperText={formErrors.email || "Valid email address required"}
              required
              InputProps={{
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUserDetails} 
            color="primary" 
            variant="contained"
            disabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserTable; 