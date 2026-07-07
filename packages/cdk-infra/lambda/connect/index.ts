import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDb);

const TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME!;
const TTL_HOURS = 24;

/**
 * WebSocket $connect handler.
 * Stores the connectionId → userId mapping in DynamoDB with a TTL.
 *
 * Expected query string: ?userId=<user-id>
 */
export const handler = async (event: any) => {
  console.log("Connect event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) {
    console.error("No connectionId in requestContext");
    return { statusCode: 400, body: "Missing connectionId" };
  }

  // Extract userId from query string parameters
  const userId =
    event.queryStringParameters?.userId ||
    event.multiValueQueryStringParameters?.userId?.[0];

  if (!userId) {
    console.error("No userId provided in query string");
    return { statusCode: 400, body: "Missing userId query parameter" };
  }

  const now = Math.floor(Date.now() / 1000);
  const expireAt = now + TTL_HOURS * 3600;

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          connectionId,
          userId,
          connectedAt: new Date().toISOString(),
          expireAt,
        },
        ConditionExpression: "attribute_not_exists(connectionId)",
      })
    );

    console.log(
      `Stored connection: ${connectionId} for user: ${userId} (TTL: ${TTL_HOURS}h)`
    );

    return { statusCode: 200, body: "Connected" };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      console.warn(
        `Connection ${connectionId} already exists — replacing (likely a reconnect)`
      );
      // Reconnect scenario — overwrite the existing connection
      try {
        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              connectionId,
              userId,
              connectedAt: new Date().toISOString(),
              expireAt,
            },
          })
        );
        return { statusCode: 200, body: "Connected (replaced)" };
      } catch (retryError) {
        console.error("Failed to replace connection:", retryError);
        return { statusCode: 500, body: "Failed to store connection" };
      }
    }

    console.error("DynamoDB error on connect:", error);
    return { statusCode: 500, body: "Internal error" };
  }
};
