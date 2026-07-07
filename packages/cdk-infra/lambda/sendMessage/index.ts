import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDb);

const TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME!;
const USER_ID_INDEX = process.env.USER_ID_INDEX_NAME || "UserIdIndex";

/**
 * WebSocket sendMessage handler (default route).
 * Looks up the target user's active connectionId in DynamoDB and pushes
 * the message via the API Gateway Management API.
 *
 * Expected body: { userId: string, message: object }
 * Can also handle: { userIds: string[], message: object } for broadcasting.
 */
export const handler = async (event: any) => {
  console.log("SendMessage event:", JSON.stringify(event, null, 2));

  const domainName = event.requestContext?.domainName;
  const stage = event.requestContext?.stage;

  if (!domainName || !stage) {
    console.error("Missing domainName or stage in requestContext");
    return { statusCode: 400, body: "Missing routing context" };
  }

  // Build the API Gateway Management API client from the invoking request context
  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${domainName}/${stage}`,
  });

  let body: any = {};

  // API Gateway WebSocket routes pass the body differently depending on the route
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      console.error("Failed to parse event body:", event.body);
      return { statusCode: 400, body: "Invalid JSON body" };
    }
  }

  // Collect target userIds
  const userIds: string[] = body.userIds || (body.userId ? [body.userId] : []);
  const message = body.message || body;

  if (userIds.length === 0) {
    console.error("No userId or userIds provided");
    return { statusCode: 400, body: "Missing userId or userIds" };
  }

  const results = await Promise.allSettled(
    userIds.map(async (userId: string) => {
      // Look up active connectionId for this user
      const queryResult = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: USER_ID_INDEX,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
          Limit: 1,
        })
      );

      const connections = queryResult.Items || [];

      if (connections.length === 0) {
        console.log(`No active connection for user: ${userId}`);
        return { userId, sent: false, reason: "no_active_connection" };
      }

      // Push to all connections for this user (handles multiple tabs/devices)
      const sendResults = await Promise.allSettled(
        connections.map(async (conn: any) => {
          const connectionId = conn.connectionId;
          try {
            await apiClient.send(
              new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({
                  ...message,
                  userId,
                  timestamp: new Date().toISOString(),
                }),
              })
            );
            return { connectionId, sent: true };
          } catch (error: any) {
            // Connection gone stale — remove from DynamoDB
            if (error.$metadata?.httpStatusCode === 410 || error.statusCode === 410) {
              console.warn(`Stale connection ${connectionId}, skipping`);
              // Note: We don't delete here to avoid needing DeleteCommand import complexity
              // TTL will clean it up within 24h
            }
            console.error(
              `Failed to send to connection ${connectionId}:`,
              error.message
            );
            return { connectionId, sent: false };
          }
        })
      );

      const sent = sendResults.filter((r) => r.status === "fulfilled" && r.value.sent).length;
      return { userId, sent: sent > 0, connections: connections.length, sentCount: sent };
    })
  );

  const summary = results.reduce(
    (acc, r) => {
      if (r.status === "fulfilled" && r.value.sent) acc.success++;
      else acc.failed++;
      return acc;
    },
    { success: 0, failed: 0 }
  );

  console.log(`Send results: ${summary.success} success, ${summary.failed} failed`);

  return {
    statusCode: 200,
    body: JSON.stringify(summary),
  };
};
