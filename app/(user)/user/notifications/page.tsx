"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useNotifications, useDeleteNotification } from "@/hooks/dashboard/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  Filter,
} from "lucide-react";

export default function UserNotificationsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const { data: notifications = [], isLoading } = useNotifications(userId);
  const deleteMutation = useDeleteNotification(userId || "");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="px-3 py-1">
            {unreadCount} new
          </Badge>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all" as const, label: "All" },
          { key: "unread" as const, label: "Unread" },
          { key: "read" as const, label: "Read" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                notification.isRead ? "bg-background" : "bg-primary/5 border-primary/20"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`mt-0.5 flex-shrink-0 ${
                    notification.isRead ? "text-muted-foreground" : "text-primary"
                  }`}
                >
                  {notification.isRead ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellRing className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.isRead ? "text-muted-foreground" : "font-medium"}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.bookingId && (
                      <Badge variant="outline" className="text-xs">
                        Booking
                      </Badge>
                    )}
                    {notification.status && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          notification.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : notification.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {notification.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(notification.id)}
                  disabled={deletingIds.has(notification.id)}
                >
                  {deletingIds.has(notification.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "unread" ? "No unread notifications" : "No notifications"}
            </h3>
            <p className="text-muted-foreground">
              {filter === "unread"
                ? "You've read all your notifications"
                : "Notifications about your bookings will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
