import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { awsWebSocketService } from "@/services/awsWebSocket";

const saveAdminNotificationSchema = z.object({
    message: z.string().min(1),
    action: z.string().optional(),
    bookingId: z.string().optional(),
    status: z.enum(['REQUESTED', 'ACCEPTED', 'REJECTED']).optional(),
    type: z.string().optional(),
    data: z.any().optional()
});

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = saveAdminNotificationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request data", details: validation.error.errors },
                { status: 400 }
            );
        }

        const { message, bookingId, status, action, type, data } = validation.data;

        // Get all admin users
        const adminUsers = await prisma.user.findMany({
            where: {
                role: "ADMIN"
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        if (adminUsers.length === 0) {
            return NextResponse.json(
                { error: "No admin users found" },
                { status: 404 }
            );
        }

        // Create notifications for all admin users
        const notifications = await Promise.all(
            adminUsers.map(admin =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        message,
                        bookingId,
                        status,
                        isRead: false,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        booking: {
                            select: {
                                id: true,
                                status: true,
                                hotel: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                })
            )
        );

        console.log(`✅ Created ${notifications.length} notifications for admin users`);

        // Push notifications to admins via WebSocket
        const adminUserIds = adminUsers.map(admin => admin.id);
        try {
            const pushResult = await awsWebSocketService.sendNotificationToUsers(adminUserIds, {
                message,
                type: type || 'notification',
                data: { bookingId, status, action },
            });
            console.log(`📡 WebSocket push result: ${pushResult.success} success, ${pushResult.failed} failed`);
        } catch (err) {
            console.error("❌ WebSocket push failed:", err);
        }

        return NextResponse.json({
            success: true,
            notifications,
            adminCount: adminUsers.length,
            message: `Notifications sent to ${adminUsers.length} admin users`
        }, { status: 201 });

    } catch (error) {
        console.error("❌ Error saving admin notifications:", error);
        return NextResponse.json(
            { error: "Failed to save admin notifications" },
            { status: 500 }
        );
    }
}