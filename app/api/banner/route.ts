import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const DEFAULT_BANNER = {
  imageUrl:
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
  title: "Find Your Perfect Stay Whatever",
  subtitle: "Discover handpicked hotels for your next adventure",
};

export async function GET() {
  try {
    const banner = await prisma.homeBanner.findFirst();
    if (!banner) {
      return NextResponse.json(DEFAULT_BANNER);
    }
    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(DEFAULT_BANNER); // Fallback to default
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, title, subtitle } = body;

    if (!imageUrl || !title || !subtitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if a banner already exists
    const existingBanner = await prisma.homeBanner.findFirst();

    let banner;
    if (existingBanner) {
      banner = await prisma.homeBanner.update({
        where: { id: existingBanner.id },
        data: {
          imageUrl,
          title,
          subtitle,
        },
      });
    } else {
      banner = await prisma.homeBanner.create({
        data: {
          imageUrl,
          title,
          subtitle,
        },
      });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 },
    );
  }
}
