import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Country, CreateCountryDto } from "@/types/country"

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      include: {
        cities: true
      },

    })
    return NextResponse.json(countries)
  } catch (error) {
    console.error("Error fetching countries:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

