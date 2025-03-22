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
import { Delete, Image } from '@mui/icons-material';
import ProfilePicture from '../../components/ProfilePicture';
import { profileService } from '../../features/profile/profileService';

interface UserTableProps {
  users: User[];
  title: string;
  onRemoveUser: (userId: string, reason?: string) => void;
  onUserUpdated?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, title, onRemoveUser, onUserUpdated }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [userForPicture, setUserForPicture] = useState<User | null>(null);

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
    </div>
  );
};

export default UserTable; 