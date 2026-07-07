import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  updateBookingNotificationStatus,
  sendBookingStatusUpdateToGuest
} from "@/services/websocketNotification";

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']),
  notificationStatus: z.enum(['REQUESTED', 'ACCEPTED', 'REJECTED']).optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update booking status
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status, notificationStatus } = validation.data;

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        hotel: true,
        rooms: {
          include: {
            room: true
          }
        }
      }
    });

 
    if (notificationStatus) {
      await prisma.notification.create({
        data: {
          userId: updatedBooking.userId,
          message: `Your booking at ${updatedBooking.hotel.name} has been ${notificationStatus.toLowerCase()}`,
          bookingId: updatedBooking.id,
          status: notificationStatus
        }
      });

      
      const bookingDetails = {
        bookingId: updatedBooking.id,
        guestName: updatedBooking.user.name || 'Guest',
        guestEmail: updatedBooking.user.email || '',
        hotelName: updatedBooking.hotel.name,
        roomName: updatedBooking.rooms[0]?.room.name || 'Room',
        checkIn: updatedBooking.checkIn.toISOString(),
        checkOut: updatedBooking.checkOut.toISOString()
      };

      if (notificationStatus === 'ACCEPTED' || notificationStatus === 'REJECTED') {
        console.log(`[Booking Status] Sending ${notificationStatus} notification to guest ${updatedBooking.userId}`);
        try {
          const result = await sendBookingStatusUpdateToGuest(
            updatedBooking.userId,
            bookingDetails,
            notificationStatus
          );
          console.log(`[Booking Status] sendBookingStatusUpdateToGuest result:`, result);
        } catch (err) {
          console.error(`[Booking Status] Failed to send notification to guest:`, err);
        }
      }

   
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      const adminUserIds = adminUsers.map(admin => admin.id);


      if (adminUserIds.length > 0) {
        await updateBookingNotificationStatus(
          updatedBooking.id,
          notificationStatus as 'ACCEPTED' | 'REJECTED',
          adminUserIds,
          bookingDetails
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}