import { NextResponse } from "next/server";
import { awsWebSocketService } from "@/services/awsWebSocket";

/**
 * Test endpoint to verify server-side WebSocket push works.
 * Usage: POST /api/test-websocket-push with { userId: "..." }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    console.log("[Test Push] Sending test notification to:", userId);

    const result = await awsWebSocketService.sendNotificationToUsers([userId], {
      message: "🔔 Test notification from server-side push",
      type: "test",
      data: { test: true, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[Test Push] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test notification" },
      { status: 500 }
    );
  }
}
