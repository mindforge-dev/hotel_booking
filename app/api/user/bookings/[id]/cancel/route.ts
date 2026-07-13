import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { awsWebSocketService } from "@/services/awsWebSocket";

// PATCH /api/user/bookings/[id]/cancel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Find the booking — ensure it belongs to this user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotel: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        rooms: { include: { room: { select: { name: true, price: true } } } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Not your booking" }, { status: 403 });
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: {
        hotel: { select: { name: true } },
      },
    });

    // Create notification for admin
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        message: `${session.user.name || "A user"} cancelled their booking for ${booking.hotel.name}`,
        bookingId,
        status: "REQUESTED",
        isRead: false,
      },
    });

    // Push real-time notification to ALL admin users via WebSocket
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (admins.length > 0) {
        const adminIds = admins.map((a) => a.id);
        await awsWebSocketService.sendNotificationToUsers(adminIds, {
          message: notification.message,
          type: "booking_cancelled",
          data: {
            bookingId,
            hotelName: booking.hotel.name,
            status: "CANCELLED",
            cancelledBy: session.user.name || "User",
          },
        });
        console.log(`[User Cancel] WebSocket push sent to ${adminIds.length} admins`);
      }
    } catch (err) {
      console.error("[User Cancel] WebSocket push failed:", err);
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
