import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/support
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return NextResponse.json({ error: "Failed to fetch support messages" }, { status: 500 });
  }
}

// POST /api/user/support
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        userId: session.user.id,
        subject,
        message,
      },
    });

    return NextResponse.json({ success: true, supportMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating support message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
