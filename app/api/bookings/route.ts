import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/authGuard";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const bookingSchema = z.object({
  hotelId: z.string().min(1),
  roomId: z.string().min(1),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Authentication check
    const session = await authGuard();
    if (!session?.user?.id || session?.user?.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // 2. Parse and validate request body
    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { hotelId, roomId, checkIn, checkOut } = validation.data;
    const userId = session.user.id; // Now properly getting userId

    // 3. Verify room exists
    const roomExists = await prisma.room.findUnique({
      where: { id: roomId, hotelId },
      select: { id: true },
    });

    if (!roomExists) {
      return NextResponse.json(
        { error: "Room not found in specified hotel" },
        { status: 404 }
      );
    }


    const booking = await prisma.booking.create({
      data: {
        hotelId,
        userId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: "PENDING",
      },
    });


    await prisma.bookingRoom.create({
      data: {
        bookingId: booking.id,
        roomId,
      },
    });


    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        message: "Booking created successfully"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Booking creation error:", error);


    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Unique constraint violation" },
          { status: 400 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Referenced record not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const session = await authGuard();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
      },
      include: {
        hotel: true,
        rooms: {
          include: {
            room: true
          }
        }
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
};
export const DELETE = async (request: Request) => {
  try {
    const session = await authGuard();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    console.log("Session user:", session.user);
    console.log("User role:", session.user?.role);



    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty booking IDs array" },
        { status: 400 }
      );
    }


    const result = await prisma.$transaction(async (tx) => {

      const bookingRooms = await tx.bookingRoom.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          bookingId: true,
        },
      });

      if (bookingRooms.length === 0) {
        throw new Error("No booking rooms found with provided IDs");
      }

      const bookingIds = bookingRooms.map(br => br.bookingId);

      // Delete booking rooms first
      await tx.bookingRoom.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      // Then delete the associated bookings
      await tx.booking.deleteMany({
        where: {
          id: {
            in: bookingIds,
          },
        },
      });

      return {
        deletedBookingRooms: bookingRooms.length,
        deletedBookings: bookingIds.length,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedBookingRooms} booking(s)`,
      deletedCount: result.deletedBookingRooms,
    });

  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookings" },
      { status: 500 }
    );
  }
};
