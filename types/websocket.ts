// WebSocket related types

export interface WebSocketMessage {
  action: string;
  userId: string;
  message: string;
  type?: string;
  data?: any;
  timestamp?: string;
  id?: string;
  isRead?: boolean;
  createdAt?: string;
  bookingId?: string;
  status?: string;
}

export interface NotificationMessage {
  action: string;
  userId: string;
  message: string;
  type?: string;
  data?: any;
}

export interface WebSocketNotificationPayload {
  action: string;
  userId: string;
  message: string;
  type?: string;
  data?: any;
}

export interface WebSocketContextType {
  sendNotification: (payload: Record<string, any>) => void;
  isConnected: boolean;
  connectionState: string;
}
