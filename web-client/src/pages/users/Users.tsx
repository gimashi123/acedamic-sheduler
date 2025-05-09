import React, { useState, useEffect } from 'react';
import { userService } from './userService';
import UserTable from './UserTable';
import RemovedUsersTable from './RemovedUsersTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { RemovedUser, User, UserRequest } from '@/data-types/user.tp.ts';
import { requestService } from '@/pages/requests/requestService.ts';
import Requests from '../requests/Requests';

const UsersPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [removedUsers, setRemovedUsers] = useState<RemovedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removedUsersError, setRemovedUsersError] = useState<string | null>(
    null,
  );
  const [tabValue, setTabValue] = useState('students');
  const [requests, setRequests] = useState<UserRequest[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setRemovedUsersError(null);

    try {
      const [studentData, lecturerData, removedData] = await Promise.allSettled(
        [
          userService.getUsersByRole('Student'),
          userService.getUsersByRole('Lecturer'),
          userService.getRemovedUsers(),
        ],
      );

      const errors = [];

      if (studentData.status === 'fulfilled') {
        setStudents(studentData.value);
      } else {
        console.error('Failed to fetch students:', studentData.reason);
        errors.push('Failed to load students');
      }

      if (lecturerData.status === 'fulfilled') {
        setLecturers(lecturerData.value);
      } else {
        console.error('Failed to fetch lecturers:', lecturerData.reason);
        errors.push('Failed to load lecturers');
      }

      if (removedData.status === 'fulfilled') {
        setRemovedUsers(removedData.value);
      } else {
        console.error('Failed to fetch removed users:', removedData.reason);
        setRemovedUsersError(
          'Could not load removed users. The feature may not be fully set up yet.',
        );
      }

      if (errors.length > 0) {
        setError(errors.join('; '));
      }
    } catch (error) {
      console.error('General error fetching users:', error);
      setError(
        'Failed to load users. Please check your connection and authentication.',
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshRemovedUsers = async () => {
    setRemovedUsersError(null);
    try {
      const removedData = await userService.getRemovedUsers();
      setRemovedUsers(removedData);
    } catch (error) {
      console.error('Error refreshing removed users:', error);
      let errorMessage = 'Could not load removed users.';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      setRemovedUsersError(errorMessage);
    }
  };

  const handleRemoveUser = async (userId: string, reason?: string) => {
    try {
      await userService.removeUser(userId, reason);

      setStudents((prev) => prev.filter((u) => u._id !== userId));
      setLecturers((prev) => prev.filter((u) => u._id !== userId));
      await refreshRemovedUsers();

      const removedUser = [...students, ...lecturers].find(
        (u) => u._id === userId,
      );
      toast.success(
        `${removedUser?.firstName} ${removedUser?.lastName} was removed successfully.`,
        {
          description: 'An email notification has been sent.',
          icon: <CheckCircle2 className="w-5 h-5" />,
        },
      );
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user. Please try again.', {
        icon: <XCircle className="w-5 h-5" />,
      });
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requests = await requestService.getPendingRequests();
      setRequests(requests);
    }
    catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again.');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                variant="link"
                className="h-auto p-0 ml-2"
                onClick={fetchUsers}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="lecturers">
            Lecturers ({lecturers.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="removed">
            Removed Users ({removedUsers.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-end">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh All
          </Button>
        </div>

        <TabsContent value="students">
          <UserTable
            users={students}
            title="Students"
            onRemoveUser={handleRemoveUser}
            onUserUpdated={fetchUsers}
          />
        </TabsContent>

        <TabsContent value="lecturers">
          <UserTable
            users={lecturers}
            title="Lecturers"
            onRemoveUser={handleRemoveUser}
            onUserUpdated={fetchUsers}
          />
        </TabsContent>

        <TabsContent value="requests">
          <Requests />
        </TabsContent>

        <TabsContent value="removed">
          <div className="space-y-4">
            {removedUsersError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Removed Users Error</AlertTitle>
                <AlertDescription>
                  {removedUsersError}
                  <Button
                    variant="link"
                    className="h-auto p-0 ml-2"
                    onClick={refreshRemovedUsers}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <RemovedUsersTable removedUsers={removedUsers} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
