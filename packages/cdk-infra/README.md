# Hotel Booking — AWS CDK Infrastructure

CDK v2 (TypeScript) infrastructure for real-time WebSocket notifications.

## Architecture

```
┌──────────────────┐        ┌─────────────────────┐        ┌───────────────────┐
│   Next.js App    │◄──────►│  API Gateway WS API  │◄──────►│  Lambda Handlers   │
│   (Frontend)     │  WSS   │  wss://.../dev       │  invoke │  connect/disconnect│
│                  │        │                      │        │  sendMessage       │
└──────────────────┘        └─────────────────────┘        └─────────┬─────────┘
                                                                      │
                                                                      ▼
                                                           ┌───────────────────┐
                                                           │  DynamoDB          │
                                                           │  WebSocketConn-    │
                                                           │  ections (TTL 24h)  │
                                                           │  PK: connectionId   │
                                                           │  GSI: userId        │
                                                           └───────────────────┘
```

### Flow

1. **Connect**: Client opens WebSocket → `$connect` Lambda stores `connectionId ↔ userId` in DynamoDB
2. **Send**: Next.js API route calls `awsWebSocketService.sendMessageToUser()` → POSTs to `sendMessage` Lambda route → Lambda looks up `userId → connectionId` in DynamoDB → pushes message via API Gateway Management API
3. **Disconnect**: Client closes WebSocket → `$disconnect` Lambda removes the DynamoDB entry
4. **TTL**: Stale connections (e.g., server crash without disconnect) auto-expire after 24 hours

## Prerequisites

- Node.js ≥ 18
- pnpm (used across the project)
- AWS CLI configured with credentials (`aws configure`)
- AWS account bootstrapped for CDK (`pnpm run bootstrap`)

## Setup

```bash
cd packages/cdk-infra

# Install dependencies (also builds the SDK Lambda layer)
pnpm install

# (Optional) Bootstrap the AWS account (first time only)
pnpm run bootstrap
```

## Deployment

```bash
# Deploy to dev stage
pnpm run deploy:dev

# Or deploy with custom stage
CDK_STAGE=staging pnpm run deploy WebSocketNotificationStack-staging

# View what will change before deploying
pnpm run diff
```

### After deployment

CDK will output the following values — add them to your root `.env`:

```env
WEBSOCKET_API_URL=https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev
NEXT_PUBLIC_WEB_SOCKET_URL=wss://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev
```

## Teardown

```bash
# Destroy all resources
pnpm run destroy
```

## Project Structure

```
packages/cdk-infra/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   └── websocket-stack.ts   # CloudFormation stack (API GW, Lambda, DynamoDB)
├── lambda/
│   ├── connect/
│   │   └── index.ts         # $connect handler — stores connection in DynamoDB
│   ├── disconnect/
│   │   └── index.ts         # $disconnect handler — removes connection
│   └── sendMessage/
│       └── index.ts         # sendMessage handler — pushes to target user
├── layer/
│   └── sdk/
│       └── nodejs/          # Lambda Layer with AWS SDK v3 bundles
├── cdk.json
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key |
| `AWS_REGION` | No | Region (default: `ap-southeast-1`) |
| `CDK_STAGE` | No | Deployment stage (default: `dev`) |

## Integration with Next.js

The refactored `services/awsWebSocket.ts` in the root project sends messages through this CDK-deployed infrastructure:

- **Server-side** (`services/awsWebSocket.ts`): POSTs to the `sendMessage` Lambda route via the API Gateway endpoint
- **Client-side** (`providers/webSocketProvider.tsx`): Connects directly to the WebSocket API Gateway endpoint with `?userId=<id>`

No `@aws-sdk` dependencies are needed in the Next.js app — all AWS SDK usage is in the Lambda layer.
