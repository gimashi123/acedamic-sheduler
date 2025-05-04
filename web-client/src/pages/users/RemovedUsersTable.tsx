import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { AlertTriangle, User } from 'lucide-react';
import { RemovedUser } from '@/data-types/user.tp.ts';

interface RemovedUsersTableProps {
  removedUsers: RemovedUser[];
}

const RemovedUsersTable: React.FC<RemovedUsersTableProps> = ({
  removedUsers,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return (
        <span className="text-destructive inline-flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          Invalid date
        </span>
      );
    }
  };

  const getRemovedByName = (user: RemovedUser) => {
    try {
      if (!user.removedBy) return 'Unknown Admin';

      if (typeof user.removedBy === 'object') {
        return `${user.removedBy.firstName || 'Unknown'} ${user.removedBy.lastName || 'Admin'}`;
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

      if (typeof user.removedBy === 'object') {
        return user.removedBy.email || 'admin@system.com';
      }

      return 'admin@system.com';
    } catch (error) {
      console.error('Error getting removed by email:', error);
      return 'admin@system.com';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Removed Users</h2>

      {removedUsers.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-5 w-5" />
          <p>No removed users found</p>
        </div>
      ) : (
        <div className="rounded-md border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                <TableHead className="min-w-[160px]">Removed Date</TableHead>
                <TableHead className="min-w-[180px]">Removed By</TableHead>
                <TableHead className="min-w-[200px]">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {removedUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {`${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                  </TableCell>
                  <TableCell>{user.email || 'unknown@example.com'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === 'Admin'
                          ? 'destructive'
                          : user.role === 'Lecturer'
                            ? 'default'
                            : 'outline'
                      }
                      className="capitalize"
                    >
                      {user.role || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.removedAt)}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        <span className="underline decoration-dotted">
                          {getRemovedByName(user)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-sm">
                          {getRemovedByEmail(user)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.reason || 'Not specified'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RemovedUsersTable;
