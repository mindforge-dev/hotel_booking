"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { notificationsQueryKey } from "@/hooks/dashboard/useNotifications";
import { saveNotification, saveNotificationToAdmins } from "@/services/notification";
import { toast } from "@/hooks/use-toast";

interface WebSocketContextType {
  sendNotification: (payload: Record<string, any>) => void;
  isConnected: boolean;
  connectionState: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const { data: session, status } = useSession();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastToastTimeRef = useRef<number>(0);

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>("disconnected");

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const TOAST_DEDUP_MS = 3000; // Minimum 3 seconds between toast notifications

  // Keep query client ref updated
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      return;
    }

    if (!session?.user?.id || status !== "authenticated") {
      return;
    }

    // Validate WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WEB_SOCKET_URL;
    if (!wsUrl) {
      console.warn("[WebSocket] NEXT_PUBLIC_WEB_SOCKET_URL is not defined");
      setConnectionState("error: missing URL");
      return;
    }

    const fullWsUrl = `${wsUrl}?userId=${session.user.id}`;

    try {
      setConnectionState("connecting");
      ws.current = new WebSocket(fullWsUrl);

      ws.current.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.action === "sendNotification") {
            // Update React Query cache so the bell badge updates immediately
            const newNotification = {
              id: data.id || `ws_${Date.now()}`,
              userId: data.userId || session.user.id,
              message: data.message,
              bookingId: data.bookingId,
              status: data.status,
              type: data.type,
              isRead: false,
              createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
              ...data,
            };

            queryClientRef.current.setQueryData(notificationsQueryKey(session.user.id), (old: any[] = []) => {
              // Deduplicate: skip if a notification with the same id or message+createdAt already exists
              const existing = old ?? [];
              const isDuplicate = existing.some(
                (n: any) =>
                  n.id === newNotification.id ||
                  (n.message === newNotification.message && n.createdAt === newNotification.createdAt)
              );
              if (isDuplicate) return existing;
              return [newNotification, ...existing];
            });

            // Show a toast popup (deduplicated within TOAST_DEDUP_MS)
            const now = Date.now();
            if (now - lastToastTimeRef.current > TOAST_DEDUP_MS) {
              lastToastTimeRef.current = now;

              const toastTitle = data.type === "booking" ? "🏨 New Booking"
                : data.type === "booking_status" ? "📋 Booking Update"
                : "🔔 Notification";

              toast({
                title: toastTitle,
                description: data.message,
                duration: 5000,
              });
            }
          }
        } catch (err) {
          console.warn("[WebSocket] Failed to parse message:", err);
        }
      };

      ws.current.onerror = () => {
        setConnectionState("error");
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionState(`closed (${event.code})`);

        // Attempt to reconnect if it wasn't a clean close
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setConnectionState("failed");
        }
      };
    } catch (error) {
      console.warn("[WebSocket] Failed to create connection:", error);
      setConnectionState("error: failed to create");
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (session?.user?.id && status === "authenticated") {
      connect();
    }

    return cleanup;
  }, [session?.user?.id, status, connect, cleanup]);

  const sendNotification = useCallback(async (payload: Record<string, any>) => {
    const isBookingNotification = payload.type === 'booking' || payload.bookingId;

    // Fire-and-forget: notifications should never block or break the calling code
    try {
      if (isBookingNotification) {
        await saveNotificationToAdmins({
          message: payload.message || '',
          action: payload.action,
          bookingId: payload.bookingId,
          status: payload.status,
          type: payload.type,
          data: payload.data
        });
      } else {
        await saveNotification({
          userId: payload.userId || session?.user?.id || '',
          message: payload.message || '',
          action: payload.action,
          bookingId: payload.bookingId,
          status: payload.status,
          type: payload.type,
          data: payload.data
        });

        // Update local query cache for regular notifications
        if (session?.user?.id) {
          queryClientRef.current.setQueryData(notificationsQueryKey(session.user.id), (old: any[] = []) => {
            const newNotification = {
              id: `temp_${Date.now()}`,
              userId: payload.userId || session.user.id,
              message: payload.message,
              bookingId: payload.bookingId,
              status: payload.status,
              isRead: false,
              createdAt: new Date().toISOString(),
              ...payload
            };

            // Deduplicate
            const existing = old ?? [];
            const isDuplicate = existing.some(
              (n: any) =>
                n.id === newNotification.id ||
                (n.message === newNotification.message && n.createdAt === newNotification.createdAt)
            );
            if (isDuplicate) return existing;
            return [newNotification, ...existing];
          });
        }
      }
    } catch (error) {
      // Never throw — notification failures must not affect booking flow
      console.error("[WebSocket] Notification delivery failed (non-blocking):", error);
    }
  }, [session?.user?.id]);

  // Always render context provider so useWebSocket hook doesn't crash children
  if (status === "loading" || status === "unauthenticated") {
    return (
      <WebSocketContext.Provider value={{
        sendNotification: async () => {
          console.warn("[WebSocket] Cannot send notification: User is not authenticated");
        },
        isConnected: false,
        connectionState: status === "loading" ? "loading" : "disconnected"
      }}>
        {children}
      </WebSocketContext.Provider>
    );
  }

  return (
    <WebSocketContext.Provider value={{
      sendNotification,
      isConnected,
      connectionState
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
