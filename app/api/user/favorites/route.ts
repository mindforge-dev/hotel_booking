import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/favorites
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            image: true,
            description: true,
            rating: true,
            amenities: true,
            city: { select: { name: true, country: { select: { name: true } } } },
            rooms: { select: { price: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

// POST /api/user/favorites — Add favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hotelId } = await request.json();
    if (!hotelId) {
      return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        hotelId,
      },
    });

    return NextResponse.json({ success: true, favorite }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Already in favorites" }, { status: 409 });
    }
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}
