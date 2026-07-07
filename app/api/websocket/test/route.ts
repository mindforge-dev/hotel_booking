import { NextResponse } from "next/server";
import { awsWebSocketService } from "@/services/awsWebSocket";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    let targetUserIds: string[] = [];

    if (userId) {
      // Send to specific user
      targetUserIds = [userId];
    } else {
      // Send to all admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true }
      });
      targetUserIds = adminUsers.map(admin => admin.id);
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: "No target users found" },
        { status: 404 }
      );
    }

    // Create notifications directly in database
    const notificationPromises = targetUserIds.map(userId => 
      prisma.notification.create({
        data: {
          userId: userId,
          message: message,
          isRead: false,
        }
      })
    );

    await Promise.all(notificationPromises);

    // Also push via WebSocket for real-time delivery
    const wsResult = await awsWebSocketService.sendNotificationToUsers(targetUserIds, {
      message: message,
      type: "test",
    });

    console.log(`Created test notifications for ${targetUserIds.length} users (DB + WebSocket: ${wsResult.success}/${wsResult.success + wsResult.failed})`);

    return NextResponse.json({
      success: true,
      message: `Test notification sent to ${targetUserIds.length} users`,
      results: {
        database: { success: targetUserIds.length, failed: 0 },
        websocket: wsResult,
      },
      targetUsers: targetUserIds,
    });

  } catch (error) {
    console.error("WebSocket test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}