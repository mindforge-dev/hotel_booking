import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from 'zod'

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()
    const countryName = formData.get("countryName") as string
    const countryCode = formData.get("countryCode") as string
    const countryImage = formData.get("countryImage") as File

    const countrySchema = z.object({
        countryName: z.string().min(1, "Country name is required"),
        countryCode: z.string().min(1, "Country code is required").max(3, "Country code must be at most 3 characters"),
        countryImage: z.instanceof(File).refine(file => file.size > 0, "Country image is required")
    })

    const parseResult = countrySchema.safeParse({ countryName, countryCode, countryImage })

    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors
        return NextResponse.json({ errors }, { status: 400 })
    }

    const imageBuffer = await countryImage.arrayBuffer()
    const imageData = Buffer.from(imageBuffer)
    const existingCountry = await prisma.country.findFirst({
        where: {
            OR: [
                { name: countryName },
                { code: countryCode.toUpperCase() }
            ]
        }
    })

    if (existingCountry) {
        return new NextResponse(
            "Country with this name or code already exists",
            { status: 409 }
        )
    }
    const newCountry = await prisma.country.create({
        data: {
            name: countryName,
            code: countryCode.toUpperCase(),
            image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80',
        },
    })


    return NextResponse.json({ message: "Country created", newCountry }, { status: 201 })
}