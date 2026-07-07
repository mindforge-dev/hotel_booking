#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { WebSocketNotificationStack } from "../lib/websocket-stack";

const app = new cdk.App({
  context: {
    stage: process.env.CDK_STAGE || "dev",
  },
});

const stage = app.node.tryGetContext("stage") as string || "dev";

new WebSocketNotificationStack(app, `WebSocketNotificationStack-${stage}`, {
  stage,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.AWS_REGION || "ap-southeast-1",
  },
});

app.synth();
