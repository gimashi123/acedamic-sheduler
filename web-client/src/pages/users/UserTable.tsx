import React, { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ImageIcon, PenSquare, FileIcon } from 'lucide-react';
import { userService } from './userService';
import { toast } from 'sonner';
import { User } from '@/data-types/user.tp.ts';
import { exportToPdf } from '@/utils/pdf-utils.tsx';
import ProfilePicture from '@/pages/profile/ProfilePicture.tsx';

interface UserTableProps {
  users: User[];
  title: string;
  onRemoveUser: (userId: string, reason?: string) => void;
  onUserUpdated?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  title,
  onRemoveUser,
  onUserUpdated,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Common validation function
  const validateField = (name: string, value: string) => {
    const errors = { ...formErrors };

    if (name === 'firstName' || name === 'lastName') {
      const nameRegex = /^[A-Za-z0-9\s]+$/;
      errors[name] =
        value && !nameRegex.test(value)
          ? 'Only letters and numbers allowed'
          : '';
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email =
        value && !emailRegex.test(value) ? 'Invalid email format' : '';
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => !error);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSaveUserDetails = async () => {
    if (!editingUser) return;

    const isValid = Object.entries(editFormData).every(([key, value]) => {
      if (!value.trim()) {
        setFormErrors((prev) => ({ ...prev, [key]: 'This field is required' }));
        return false;
      }
      return true;
    });

    if (!isValid) return;

    try {
      await userService.updateUser(editingUser._id, editFormData);
      toast.success('User updated successfully');
      onUserUpdated?.();
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleExportToPdf = () => {
    exportToPdf({
      title: `${title} - User List`,
      filename: `users-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'First Name', dataKey: 'firstName' },
        { header: 'Last Name', dataKey: 'lastName' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Role', dataKey: 'role' },
      ],
      data: users,
    });
    toast.success('PDF exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Button onClick={handleExportToPdf} variant="outline" className="gap-2">
          <FileIcon className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No {title.toLowerCase()} found
        </div>
      ) : (
        <div className="rounded-md border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[250px]">Email</TableHead>
                <TableHead className="min-w-[150px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/30">
                  <TableCell>
                    <ProfilePicture
                      profilePicture={user.profilePicture}
                      size="small"
                      className="h-10 w-10"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {`${user.firstName} ${user.lastName}`}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Profile Picture</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center gap-4 py-4">
                            <ProfilePicture
                              profilePicture={selectedUser?.profilePicture}
                              size="large"
                              editable
                              userId={selectedUser?._id}
                              className="h-32 w-32"
                              onUpdate={onUserUpdated}
                            />
                            <p className="font-medium">
                              {selectedUser?.firstName} {selectedUser?.lastName}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setEditFormData({
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                              });
                            }}
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user details below. Click save when you're
                              done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={editFormData.firstName}
                                onChange={handleEditFormChange}
                              />
                              {formErrors.firstName && (
                                <p className="text-sm text-destructive">
                                  {formErrors.firstName}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={editFormData.lastName}
                                onChange={handleEditFormChange}
                              />
                              {formErrors.lastName && (
                                <p className="text-sm text-destructive">
                                  {formErrors.lastName}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={editFormData.email}
                                onChange={handleEditFormChange}
                              />
                              {formErrors.email && (
                                <p className="text-sm text-destructive">
                                  {formErrors.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={handleSaveUserDetails}
                              disabled={Object.values(formErrors).some(Boolean)}
                            >
                              Save changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Confirm Removal</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove{' '}
                              {selectedUser?.firstName} {selectedUser?.lastName}
                              ?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="reason">Reason (optional)</Label>
                              <Input
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter removal reason..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (selectedUser) {
                                  onRemoveUser(selectedUser._id, reason);
                                  setSelectedUser(null);
                                  setReason('');
                                }
                              }}
                            >
                              Confirm Remove
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
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

export default UserTable;
