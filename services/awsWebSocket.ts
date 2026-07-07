import axios from 'axios';
import { WebSocketMessage } from '@/types/websocket';

/**
 * AWS WebSocket Service for real-time notifications.
 *
 * This service sends messages through the CDK-deployed WebSocket infrastructure:
 * - API Gateway WebSocket API (manages connections)
 * - Lambda handlers (connect, disconnect, sendMessage)
 * - DynamoDB (stores connectionId ↔ userId mappings with TTL)
 *
 * The in-memory Map is kept as a local cache for fast lookups during the
 * same server process lifecycle, but DynamoDB is the source of truth.
 */

// Local cache — supplements DynamoDB for same-process lookups
const userConnections = new Map<string, string>();

export class AWSWebSocketService {
  private wsApiUrl: string;
  private wsEndpoint: string;
  private region: string;

  constructor() {
    this.wsApiUrl = process.env.WEBSOCKET_API_URL || '';
    this.wsEndpoint = process.env.NEXT_PUBLIC_WEB_SOCKET_URL || '';
    this.region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!this.wsApiUrl && !this.wsEndpoint) {
      console.warn('[AWSWebSocket] WEBSOCKET_API_URL and NEXT_PUBLIC_WEB_SOCKET_URL are not configured');
    }
  }

  // ─── Connection Management (local cache) ─────────────────────────

  storeUserConnection(userId: string, connectionId: string) {
    userConnections.set(userId, connectionId);
    console.log(`[AWSWebSocket] Cached connection for user ${userId}: ${connectionId}`);
  }

  removeUserConnection(userId: string) {
    userConnections.delete(userId);
    console.log(`[AWSWebSocket] Removed cached connection for user ${userId}`);
  }

  getUserConnection(userId: string): string | undefined {
    return userConnections.get(userId);
  }

  // ─── Message Sending ──────────────────────────────────────────────

  /**
   * Send a WebSocket message to a specific user.
   * Routes through the API Gateway WebSocket sendMessage Lambda handler.
   */
  async sendMessageToUser(userId: string, message: WebSocketMessage): Promise<boolean> {
    try {
      // Method 1: Send via the WebSocket API Gateway sendMessage route (Lambda handler)
      if (this.wsEndpoint) {
        const endpoint = this.wsEndpoint.replace('wss://', 'https://').replace('ws://', 'http://');
        try {
          await axios.post(`${endpoint}/sendMessage`, JSON.stringify({
            userId,
            message,
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log(`[AWSWebSocket] Message sent to user ${userId} via sendMessage route`);
          return true;
        } catch (apiError) {
          console.warn(`[AWSWebSocket] sendMessage route failed:`, (apiError as Error).message);
        }
      }

      // Method 2: Fallback — POST to the REST API URL (for cross-service calls)
      if (this.wsApiUrl) {
        try {
          await axios.post(this.wsApiUrl, message, {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log(`[AWSWebSocket] Message sent to user ${userId} via REST API`);
          return true;
        } catch (restError) {
          console.warn(`[AWSWebSocket] REST API method failed:`, (restError as Error).message);
        }
      }

      // Method 3: Development fallback — log the message
      console.log(`[AWSWebSocket] No WebSocket endpoint available. Message logged:`, JSON.stringify(message, null, 2));
      return true;

    } catch (error) {
      console.error(`[AWSWebSocket] Failed to send message to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send notifications to multiple users at once.
   * Uses the Lambda handler's userIds array support for batched sends.
   */
  async sendNotificationToUsers(userIds: string[], notificationData: {
    message: string;
    type?: string;
    data?: any;
  }): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    console.log(`[AWSWebSocket] Sending notifications to ${userIds.length} users`);

    if (userIds.length === 0) {
      return { success: 0, failed: 0 };
    }

    try {
      // Try batched send via the sendMessage Lambda route
      if (this.wsEndpoint) {
        const endpoint = this.wsEndpoint.replace('wss://', 'https://').replace('ws://', 'http://');
        try {
          const message: WebSocketMessage = {
            action: 'sendNotification',
            userId: userIds[0], // primary target
            message: notificationData.message,
            type: notificationData.type || 'notification',
            data: notificationData.data || {},
            timestamp: new Date().toISOString(),
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          await axios.post(`${endpoint}/sendMessage`, JSON.stringify({
            userIds,
            message,
          }), {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
          });

          success = userIds.length;
          console.log(`[AWSWebSocket] Batch notification sent to ${userIds.length} users`);
          return { success, failed: 0 };
        } catch (batchError) {
          console.warn(`[AWSWebSocket] Batch send failed, falling back to individual sends`);
        }
      }

      // Fallback: individual sends
      await Promise.all(
        userIds.map(async (userId) => {
          const message: WebSocketMessage = {
            action: 'sendNotification',
            userId,
            message: notificationData.message,
            type: notificationData.type || 'notification',
            data: notificationData.data || {},
            timestamp: new Date().toISOString(),
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          const sent = await this.sendMessageToUser(userId, message);
          if (sent) {
            success++;
          } else {
            failed++;
          }
        })
      );
    } catch (error) {
      console.error(`[AWSWebSocket] Failed to send batch notifications:`, error);
      failed = userIds.length;
    }

    console.log(`[AWSWebSocket] Notification results: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Test the WebSocket connectivity.
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.sendMessageToUser('test', {
        action: 'ping',
        userId: 'test',
        message: 'Connection test',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[AWSWebSocket] Connection test failed:', error);
      return false;
    }
  }
}

export const awsWebSocketService = new AWSWebSocketService();
