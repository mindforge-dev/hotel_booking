import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from '@/lib/imageUpload/cloudinaryImageUpload';
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Debug log
    console.log('FormData entries:', Array.from(formData.entries()));

    // Extract form fields
    const name = formData.get('name') as string;
    const cityId = formData.get('cityId') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image');
    const rating = parseFloat(formData.get('rating') as string);
    const featured = formData.get('featured') === 'true';
    const amenities = JSON.parse(formData.get('amenities') as string);

    // Validate input
    if (!name || !cityId || !description || !imageFile || isNaN(rating) || !amenities) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle image - if it's a URL, use it directly, otherwise upload it
    let imageUrl: string;
    if (typeof imageFile === 'string' && imageFile.startsWith('http')) {
      imageUrl = imageFile;
    } else {
      imageUrl = await uploadToCloudinary(imageFile);
      if (!imageUrl) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    // Create a new hotel
    const newHotel = await prisma.hotel.create({
      data: {
        latitude: 0,
        longitude: 0,
        name,
        cityId,
        description,
        image: imageUrl,
        rating,
        featured,
        amenities,
      },
    });

    return NextResponse.json(newHotel, { status: 201 });
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const search = searchParams.get("search") || undefined;
    const cityId = searchParams.get("city") || undefined;
    const rating = searchParams.get("rating") || undefined;
    const countryId = searchParams.get("country") || undefined;

    const filters: any = {};

    if (search) {
      filters.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (countryId) {
      filters.city = {
        country: {
          id: countryId,
        },
      };
    }

    if (rating) {
      filters.rating = {
        gte: parseFloat(rating),
      };
    }

    if (cityId) {
      filters.city = {
        id: cityId,
      };
    }

    const hotels = await prisma.hotel.findMany({
      where: filters,
      include: {
        city: {
          include: {
            country: true,
          },
        },
      },
    });

    return NextResponse.json({ hotels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}