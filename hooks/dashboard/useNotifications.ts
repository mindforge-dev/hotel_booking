import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, deleteNotification, updateNotificationStatus } from "@/services/notification";
import { Notification } from "@prisma/client";
export const notificationsQueryKey = (userId: string) => ['notifications', userId];

export const useNotifications = (userId: string | undefined) => {
  return useQuery<Notification[]>({
    queryKey: notificationsQueryKey(userId || ''),
    queryFn: () => getNotifications(userId!),
    enabled: !!userId && userId.trim() !== '',
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't re-fetch if cache already has data (WebSocket keeps it fresh)
    staleTime: 1000 * 60 * 5, // 5 minutes — WebSocket handles real-time updates
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeleteNotification = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId)
      });
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
    }
  });
};
export const useUpdateNotificationStatus = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, status }: {
      notificationId: string;
      status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED'
    }) => updateNotificationStatus(notificationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId)
      });
    },
    onError: (error) => {
      console.error("Error updating notification status:", error);
    }
  });
};
