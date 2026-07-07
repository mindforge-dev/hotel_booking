import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoDb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDb);

const TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME!;

/**
 * WebSocket $disconnect handler.
 * Removes the connectionId from DynamoDB.
 */
export const handler = async (event: any) => {
  console.log("Disconnect event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) {
    console.error("No connectionId in requestContext");
    return { statusCode: 400, body: "Missing connectionId" };
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { connectionId },
      })
    );

    console.log(`Removed connection: ${connectionId}`);
    return { statusCode: 200, body: "Disconnected" };
  } catch (error) {
    console.error("DynamoDB error on disconnect:", error);
    return { statusCode: 500, body: "Internal error" };
  }
};
