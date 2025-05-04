import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { requestService } from './requestService';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { UserRequest } from '@/data-types/user.tp.ts';
import { CheckIcon, RefreshCcw, XCircle } from 'lucide-react';

const Requests: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await requestService.getPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests().then();
  }, []);

  const handleApprove = async (requestId: string) => {
    setIsApproving(true);
    try {
      await requestService.approveRequest(requestId);
      toast.success('Request approved successfully');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsRejecting(true);
    try {
      await requestService.rejectRequest(requestId);
      toast.success('Request rejected successfully');
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!pendingRequests?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 text-center">
        <h3 className="text-xl font-semibold text-gray-500">
          No pending requests found
        </h3>
        <Button variant="outline" onClick={fetchPendingRequests}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Pending Registration Requests
        </h1>
        <Button variant="outline" onClick={fetchPendingRequests}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Role</TableHead>
              <TableHead className="min-w-[200px]">Details</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[180px]">Submitted</TableHead>
              <TableHead className="min-w-[200px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRequests.map((request) => (
              <TableRow key={request._id} className="hover:bg-gray-50/30">
                <TableCell className="font-medium">
                  {`${request.firstName} ${request.lastName}`}
                </TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell className="capitalize">{request.role}</TableCell>
                <TableCell>
                  {request.additionalDetails || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      request.status === 'Pending'
                        ? 'outline'
                        : request.status === 'Approved'
                          ? 'outline'
                          : 'destructive'
                    }
                    className="capitalize"
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(request._id)}
                      disabled={isApproving || request.status !== 'Pending'}
                    >
                      {isApproving ? (
                        <span className="animate-spin">
                          <RefreshCcw className="h-4 w-4" />
                        </span>
                      ) : (
                        <>
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request._id)}
                      disabled={isRejecting || request.status !== 'Pending'}
                    >
                      {isRejecting ? (
                        <span className="animate-spin">
                          <RefreshCcw className="h-4 w-4" />
                        </span>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Requests;
