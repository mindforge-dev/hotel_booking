import * as cdk from "aws-cdk-lib";
import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwIntegration from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

export interface WebSocketNotificationStackProps extends StackProps {
  stage: string;
}

export class WebSocketNotificationStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: WebSocketNotificationStackProps,
  ) {
    super(scope, id, props);

    const { stage } = props;

    // ────────────────────────────────────────────────
    // DynamoDB Table — WebSocket Connections
    // ────────────────────────────────────────────────
    const connectionsTable = new dynamodb.Table(this, "WebSocketConnections", {
      tableName: `WebSocketConnections-${stage}`,
      partitionKey: {
        name: "connectionId",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expireAt",
    });

    connectionsTable.addGlobalSecondaryIndex({
      indexName: "UserIdIndex",
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // ────────────────────────────────────────────────
    // Lambda Layer — Shared AWS SDK bundles
    // ────────────────────────────────────────────────
    const sdkLayer = new lambda.LayerVersion(this, "SdkLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "../layer/sdk")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: "AWS SDK v3 client bundles for Lambda handlers",
    });

    // ────────────────────────────────────────────────
    // Lambda Handlers
    // ────────────────────────────────────────────────
    const handlerProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        CONNECTIONS_TABLE_NAME: connectionsTable.tableName,
        USER_ID_INDEX_NAME: "UserIdIndex",
        LOG_LEVEL: "INFO",
      },
      layers: [sdkLayer],
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        format: lambdaNodejs.OutputFormat.ESM,
        externalModules: [
          "@aws-sdk/client-dynamodb",
          "@aws-sdk/lib-dynamodb",
          "@aws-sdk/client-apigatewaymanagementapi",
        ],
      },
    };

    const connectHandler = new lambdaNodejs.NodejsFunction(
      this,
      "ConnectHandler",
      {
        entry: path.join(__dirname, "../lambda/connect/index.ts"),
        handler: "handler",
        ...handlerProps,
      },
    );

    const disconnectHandler = new lambdaNodejs.NodejsFunction(
      this,
      "DisconnectHandler",
      {
        entry: path.join(__dirname, "../lambda/disconnect/index.ts"),
        handler: "handler",
        ...handlerProps,
      },
    );

    const sendHandler = new lambdaNodejs.NodejsFunction(
      this,
      "SendMessageHandler",
      {
        entry: path.join(__dirname, "../lambda/sendMessage/index.ts"),
        handler: "handler",
        ...handlerProps,
      },
    );

    // ────────────────────────────────────────────────
    // Grant DynamoDB permissions to all handlers
    // ────────────────────────────────────────────────
    connectionsTable.grantReadWriteData(connectHandler);
    connectionsTable.grantReadWriteData(disconnectHandler);
    connectionsTable.grantReadData(sendHandler);

    // ────────────────────────────────────────────────
    // WebSocket API Gateway — using Lambda Proxy Integration
    // WebSocketLambdaIntegration creates AWS_PROXY integration type,
    // which passes the full event (requestContext, queryStringParameters, body)
    // to the Lambda function.
    // ────────────────────────────────────────────────
    const webSocketApi = new apigw.WebSocketApi(this, "WebSocketApi", {
      apiName: `HotelBookingWebSocket-${stage}`,
      connectRouteOptions: {
        integration: new apigwIntegration.WebSocketLambdaIntegration(
          "ConnectIntegration",
          connectHandler,
        ),
      },
      disconnectRouteOptions: {
        integration: new apigwIntegration.WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnectHandler,
        ),
      },
      defaultRouteOptions: {
        integration: new apigwIntegration.WebSocketLambdaIntegration(
          "SendMessageIntegration",
          sendHandler,
        ),
      },
    });

    // Create a deployment stage
    const wsStage = new apigw.WebSocketStage(this, "WebSocketStage", {
      webSocketApi,
      stageName: stage,
      autoDeploy: true,
    });

    // Grant the send handler permission to manage WebSocket connections
    // (needed for postToConnection in the sendMessage Lambda)
    sendHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["execute-api:ManageConnections"],
        resources: [
          `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/${stage}/*/@connections/*`,
        ],
      }),
    );

    // ────────────────────────────────────────────────
    // Outputs
    // ────────────────────────────────────────────────
    new CfnOutput(this, "WebSocketApiUrl", {
      value: wsStage.url,
      description: `WebSocket API endpoint URL (wss://...)`,
      exportName: `WebSocketApiUrl-${stage}`,
    });

    new CfnOutput(this, "WebSocketApiId", {
      value: webSocketApi.apiId,
      description: "WebSocket API ID",
      exportName: `WebSocketApiId-${stage}`,
    });

    new CfnOutput(this, "ConnectionsTableName", {
      value: connectionsTable.tableName,
      description: "DynamoDB table name for WebSocket connections",
      exportName: `ConnectionsTableName-${stage}`,
    });

    new CfnOutput(this, "Region", {
      value: this.region,
      description: "AWS region of deployment",
      exportName: `WebSocketRegion-${stage}`,
    });
  }
}
