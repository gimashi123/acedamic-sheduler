import React from 'react';
import { RemovedUser } from '../../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Tooltip,
  Typography
} from '@mui/material';
import { format } from 'date-fns';

interface RemovedUsersTableProps {
  removedUsers: RemovedUser[];
}

const RemovedUsersTable: React.FC<RemovedUsersTableProps> = ({ removedUsers }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getRemovedByName = (user: RemovedUser) => {
    try {
      if (!user.removedBy) return 'Unknown Admin';
      
      if (typeof user.removedBy === 'object' && user.removedBy !== null) {
        const firstName = user.removedBy.firstName || 'Unknown';
        const lastName = user.removedBy.lastName || 'Admin';
        return `${firstName} ${lastName}`;
      }
      
      return 'System Admin';
    } catch (error) {
      console.error('Error getting removed by name:', error);
      return 'Unknown Admin';
    }
  };

  const getRemovedByEmail = (user: RemovedUser) => {
    try {
      if (!user.removedBy) return 'admin@system.com';
      
      if (typeof user.removedBy === 'object' && user.removedBy !== null) {
        return user.removedBy.email || 'admin@system.com';
      }
      
      return 'admin@system.com';
    } catch (error) {
      console.error('Error getting removed by email:', error);
      return 'admin@system.com';
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Removed Users</h2>
      {removedUsers.length === 0 ? (
        <p className="text-gray-500">No removed users found.</p>
      ) : (
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Removed Date</TableCell>
                <TableCell>Removed By</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {removedUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{`${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}</TableCell>
                  <TableCell>{user.email || 'unknown@example.com'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role || 'Unknown'} 
                      color={
                        user.role === 'Admin' 
                          ? 'error' 
                          : user.role === 'Lecturer' 
                            ? 'primary' 
                            : 'default'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(user.removedAt)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={getRemovedByEmail(user)}>
                      <Typography variant="body2">
                        {getRemovedByName(user)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{user.reason || 'Not specified'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default RemovedUsersTable; 