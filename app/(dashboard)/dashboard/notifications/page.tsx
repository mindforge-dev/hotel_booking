"use client";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useDeleteNotification } from "@/hooks/dashboard/useNotifications";
import { useRealtimeNotifications } from "@/hooks/dashboard/useRealtimeNotifications";
import { BellRing, Check, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  const { data: notifications = [], isLoading } = useRealtimeNotifications(userId || "");
  const deleteNotificationMutation = useDeleteNotification(userId || "");
  console.log(notifications)
  const handleDeleteNotification = async (notificationId: string) => {
    setDeletingIds(prev => new Set(prev).add(notificationId));
    
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={`loading-skeleton-${index}`} className="flex items-start p-4">
              <div className="mt-1 mr-4 h-6 w-6 bg-muted animate-pulse rounded-full" />
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <BellRing className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up! No new notifications.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications?.map((notification) => (
            <Card key={notification.id} className="flex items-start p-4">
              <BellRing className="mt-1 mr-4 h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">{notification.message}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="icon">
                  {notification.isRead ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Check className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNotification(notification.id)}
                  disabled={deletingIds.has(notification.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-destructive/10"
                >
                  {deletingIds.has(notification.id) ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
}
