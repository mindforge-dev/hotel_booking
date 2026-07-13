import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/loyalty
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total points
    const totalResult = await prisma.loyaltyPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    // Get points history
    const history = await prisma.loyaltyPoint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Determine tier based on total points
    const totalPoints = totalResult._sum.points || 0;
    let tier = "Bronze";
    let nextTier = "Silver";
    let nextTierPoints = 1000;

    if (totalPoints >= 1000 && totalPoints < 5000) {
      tier = "Silver";
      nextTier = "Gold";
      nextTierPoints = 5000;
    } else if (totalPoints >= 5000 && totalPoints < 10000) {
      tier = "Gold";
      nextTier = "Platinum";
      nextTierPoints = 10000;
    } else if (totalPoints >= 10000) {
      tier = "Platinum";
      nextTier = null;
      nextTierPoints = 10000;
    }

    return NextResponse.json({
      totalPoints,
      tier,
      nextTier,
      nextTierPoints,
      history,
    });
  } catch (error) {
    console.error("Error fetching loyalty data:", error);
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 });
  }
}
