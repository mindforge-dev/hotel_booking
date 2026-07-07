import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getNotifications } from "@/services/notification";
import { Notification } from "@prisma/client";
import { notificationsQueryKey } from "./useNotifications";

export const useRealtimeNotifications = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef<number>(0);

  // Base query for notifications
  const query = useQuery<Notification[]>({
    queryKey: notificationsQueryKey(userId || ''),
    queryFn: () => getNotifications(userId!),
    enabled: !!userId && userId.trim() !== '',
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Smart polling that only logs when count changes
  useEffect(() => {
    if (!userId || userId.trim() === '') return;

    const pollForUpdates = async () => {
      try {
        const notifications = await getNotifications(userId);
        const currentCount = notifications.length;
        
        // Only update if count changed
        if (currentCount !== lastCountRef.current) {
          const timestamp = new Date().toLocaleTimeString();
          console.log(`🔔 [${timestamp}] Notification count changed: ${lastCountRef.current} → ${currentCount}`);
          
          queryClient.setQueryData(notificationsQueryKey(userId), notifications);
          lastCountRef.current = currentCount;
        }
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    };

    // Initial fetch
    if (query.data) {
      lastCountRef.current = query.data.length;
    }

    // Set up polling interval
    intervalRef.current = setInterval(pollForUpdates, 3000); // Poll every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, queryClient, query.data]);

  // Manual refresh function
  const refreshNotifications = async () => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] Manual refresh triggered`);
    await query.refetch();
  };

  return {
    ...query,
    refreshNotifications,
    notificationCount: query.data?.length || 0,
    unreadCount: query.data?.filter(n => !n.isRead).length || 0,
  };
};