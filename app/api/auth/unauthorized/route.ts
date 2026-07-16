import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Unauthorized. You do not have permission to access this resource." },
    { status: 403 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Unauthorized. You do not have permission to access this resource." },
    { status: 403 }
  );
}
