import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from './requestService';

import { toast } from 'react-hot-toast';
import { UserRequest } from '@/data-types/user.tp.ts';

export const useRequests = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(
    null,
  );

  // Fetch pending requests
  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: requestService.getPendingRequests,
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: requestService.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] }).then();
      toast.success('Request approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: requestService.rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] }).then();
      toast.success('Request rejected successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    },
  });

  const handleApprove = async (requestId: string) => {
    try {
      await approveMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return {
    pendingRequests,
    isLoading,
    selectedRequest,
    setSelectedRequest,
    handleApprove,
    handleReject,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};
