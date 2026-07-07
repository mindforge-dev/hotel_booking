import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/authGuard";
import { z } from "zod";
import { NotificationStatus } from "@prisma/client";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingRoomId = id;

    // Get the booking room with all related data
    const bookingRoom = await prisma.bookingRoom.findUnique({
      where: { id: bookingRoomId },
      include: {
        booking: {
          include: {
            hotel: {
              include: {
                city: {
                  include: {
                    country: true,
                  },
                },
              },
            },
            user: true,
            notifications: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        room: true,
      },
    });

    if (!bookingRoom) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: bookingRoom,
    });

  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (for now, allow any authenticated user)
    // TODO: Uncomment when role is properly included in session
    // if (session.user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid status", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status } = validation.data;
    const { id } = await params;
    const bookingId = id;

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        hotel: true,
        user: true,
      },
    });

    // Create a notification for the user about the status change
    let notificationMessage = "";
    let notificationStatus: NotificationStatus = "REQUESTED";

    switch (status) {
      case "CONFIRMED":
        notificationMessage = `Your booking for ${updatedBooking.hotel.name} has been confirmed!`;
        notificationStatus = "ACCEPTED";
        break;
      case "REJECTED":
        notificationMessage = `Your booking for ${updatedBooking.hotel.name} has been rejected.`;
        notificationStatus = "REJECTED";
        break;
      case "CANCELLED":
        notificationMessage = `Your booking for ${updatedBooking.hotel.name} has been cancelled.`;
        notificationStatus = "REJECTED";
        break;
      case "COMPLETED":
        notificationMessage = `Your booking for ${updatedBooking.hotel.name} has been completed. Thank you for staying with us!`;
        notificationStatus = "ACCEPTED";
        break;
      default:
        notificationMessage = `Your booking status for ${updatedBooking.hotel.name} has been updated to ${status.toLowerCase()}.`;
        notificationStatus = "REQUESTED";
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: updatedBooking.userId,
        message: notificationMessage,
        bookingId: updatedBooking.id,
        status: notificationStatus,
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: "Booking status updated successfully",
    });

  } catch (error) {
    console.error("Booking status update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
} 