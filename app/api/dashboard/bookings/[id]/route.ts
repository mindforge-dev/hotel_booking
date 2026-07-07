import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/bookings/[id] - Get specific booking for dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authGuard();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = id;

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId
      },
      include: {
        hotel: {
          include: {
            city: {
              include: {
                country: true
              }
            },
            rooms: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Get booking rooms to find the associated room
    const bookingRooms = await prisma.bookingRoom.findMany({
      where: {
        bookingId: booking.id
      },
      include: {
        room: true
      }
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingId: booking.id,
        roomId: bookingRooms[0]?.roomId || null,
        booking,
        room: bookingRooms[0]?.room || null
      }
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authGuard();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = id;
    const { status } = await request.json();

    if (!status || !["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status
      },
      include: {
        hotel: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for status change
    await prisma.notification.create({
      data: {
        userId: updatedBooking.userId,
        message: `Your booking for ${updatedBooking.hotel.name} has been ${status.toLowerCase()}`,
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/bookings/[id] - Delete specific booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authGuard();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotel: { select: { name: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Delete booking rooms first, then the booking
    await prisma.bookingRoom.deleteMany({
      where: { bookingId: booking.id }
    });

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    // Create notification for booking deletion
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        message: `Your booking for ${booking.hotel.name} has been cancelled`,
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}