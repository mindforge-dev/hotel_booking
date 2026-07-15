import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard } from "@/lib/authGuard";

export async function GET(request: Request) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);


    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;


    const name = searchParams.get("name") || "";
    const hotelId = searchParams.get("hotelId") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const available = searchParams.get("available");


    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    if (hotelId) {
      where.hotelId = hotelId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (available !== null && available !== "") {
      where.available = {
        gt: parseInt(available) || 0,
      };
    }

    // Get rooms with pagination, filtering, and aggregate stats
    const [rooms, totalCount, bookingStats, roomStats] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
      prisma.bookingRoom.aggregate({
        _count: true,
      }),
      prisma.room.aggregate({
        _sum: {
          available: true,
          price: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      rooms,
      stats: {
        _sum: {
          available: roomStats._sum.available,
          price: roomStats._sum.price,
        },
        _count: bookingStats._count,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty room IDs array" },
        { status: 400 }
      );
    }

    // Delete rooms in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First delete related booking rooms
      await tx.bookingRoom.deleteMany({
        where: {
          roomId: {
            in: ids,
          },
        },
      });

      // Then delete the rooms
      await tx.room.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      return { deletedCount: ids.length };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} room(s)`,
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error("Batch delete rooms error:", error);
    return NextResponse.json(
      { error: "Failed to delete rooms" },
      { status: 500 }
    );
  }
}