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
  TextField
} from '@mui/material';
import { Delete } from '@mui/icons-material';

interface UserTableProps {
  users: User[];
  title: string;
  onRemoveUser: (userId: string, reason?: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, title, onRemoveUser }) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');

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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleClickOpen(user)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Confirm User Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'this user'}? 
            This action cannot be undone and the user will be notified via email.
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
    </div>
  );
};

export default UserTable; 