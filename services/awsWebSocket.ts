import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { WebSocketMessage } from "@/types/websocket";

/**
 * AWS WebSocket Service for real-time notifications.
 *
 * Uses the AWS SDK directly to:
 * 1. Query DynamoDB for the target user's connectionId(s)
 * 2. Push messages via ApiGatewayManagementApiClient.postToConnection()
 *
 * This avoids trying to HTTP POST to a WebSocket API endpoint (which doesn't work).
 */

const REGION = process.env.AWS_REGION || "ap-southeast-1";

// Singleton clients — lazily initialized
let docClient: DynamoDBDocumentClient | null = null;
let managementApiClients: Map<string, ApiGatewayManagementApiClient> = new Map();

function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const dynamoDb = new DynamoDBClient({ region: REGION });
    docClient = DynamoDBDocumentClient.from(dynamoDb);
  }
  return docClient;
}

function getManagementApiClient(apiId: string): ApiGatewayManagementApiClient {
  if (!managementApiClients.has(apiId)) {
    managementApiClients.set(
      apiId,
      new ApiGatewayManagementApiClient({
        endpoint: `https://${apiId}.execute-api.${REGION}.amazonaws.com/dev`,
        region: REGION,
      })
    );
  }
  return managementApiClients.get(apiId)!;
}

export class AWSWebSocketService {
  private apiId: string;
  private tableName: string;
  private userIdIndex: string;

  constructor() {
    const apiUrl = process.env.WEBSOCKET_API_URL || "";
    // Extract API ID from URL: https://{apiId}.execute-api.{region}.amazonaws.com/{stage}
    const match = apiUrl.match(/https:\/\/([^.]+)\.execute-api\./);
    this.apiId = match ? match[1] : "";
    this.tableName = process.env.CONNECTIONS_TABLE_NAME || "WebSocketConnections-dev";
    this.userIdIndex = process.env.USER_ID_INDEX_NAME || "UserIdIndex";

    console.log(`[AWSWebSocket] Initialized — API URL: ${apiUrl}, API ID: ${this.apiId}, Table: ${this.tableName}`);

    if (!this.apiId) {
      console.warn("[AWSWebSocket] Cannot extract API ID from WEBSOCKET_API_URL");
    }
  }

  /**
   * Query DynamoDB for all active connectionIds belonging to a user.
   */
  private async getUserConnections(userId: string): Promise<string[]> {
    const client = getDocClient();
    const result = await client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
    );
    return (result.Items || []).map((item: any) => item.connectionId);
  }

  /**
   * Push a message to a single WebSocket connection.
   */
  private async postToConnection(
    connectionId: string,
    message: WebSocketMessage
  ): Promise<boolean> {
    try {
      const client = getManagementApiClient(this.apiId);
      await client.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(message)),
        })
      );
      return true;
    } catch (error: any) {
      // 410 Gone = stale connection
      if (error.$metadata?.httpStatusCode === 410 || error.name === "GoneException") {
        console.warn(`[AWSWebSocket] Stale connection: ${connectionId}`);
      } else {
        console.error(`[AWSWebSocket] postToConnection failed for ${connectionId}:`, error.message);
      }
      return false;
    }
  }

  /**
   * Send a WebSocket message to a specific user.
   */
  async sendMessageToUser(userId: string, message: WebSocketMessage): Promise<boolean> {
    if (!this.apiId) {
      console.log("[AWSWebSocket] No API ID configured, message logged:", message.message);
      return false;
    }

    try {
      const connectionIds = await this.getUserConnections(userId);
      if (connectionIds.length === 0) {
        console.log(`[AWSWebSocket] No active connection for user: ${userId}`);
        return false;
      }

      const results = await Promise.allSettled(
        connectionIds.map((connId) => this.postToConnection(connId, message))
      );
      const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
      console.log(`[AWSWebSocket] Sent to ${sent}/${connectionIds.length} connections for user ${userId}`);
      return sent > 0;
    } catch (error) {
      console.error(`[AWSWebSocket] sendMessageToUser failed for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send notifications to multiple users.
   */
  async sendNotificationToUsers(
    userIds: string[],
    notificationData: { message: string; type?: string; data?: any }
  ): Promise<{ success: number; failed: number }> {
    if (userIds.length === 0) return { success: 0, failed: 0 };

    if (!this.apiId) {
      console.log("[AWSWebSocket] No API ID configured, batch message logged for", userIds.length, "users");
      return { success: 0, failed: userIds.length };
    }

    let success = 0;
    let failed = 0;

    // Build a single message object
    const message: WebSocketMessage = {
      action: "sendNotification",
      userId: "",
      message: notificationData.message,
      type: notificationData.type || "notification",
      data: notificationData.data || {},
      timestamp: new Date().toISOString(),
      id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Process all users (query their connections + push in parallel)
    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        try {
          const connectionIds = await this.getUserConnections(userId);
          if (connectionIds.length === 0) {
            return { userId, sent: false, reason: "no_connection" };
          }

          const userMessage = { ...message, userId };
          const sendResults = await Promise.allSettled(
            connectionIds.map((connId) => this.postToConnection(connId, userMessage))
          );
          const sent = sendResults.filter((r) => r.status === "fulfilled" && r.value).length;
          return { userId, sent: sent > 0, connections: connectionIds.length };
        } catch (error) {
          console.error(`[AWSWebSocket] Failed for user ${userId}:`, error);
          return { userId, sent: false };
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.sent) success++;
      else failed++;
    }

    console.log(`[AWSWebSocket] Batch result: ${success} success, ${failed} failed`);
    return { success, failed };
  }
}

export const awsWebSocketService = new AWSWebSocketService();
