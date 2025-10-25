"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RoomSchema } from "@/schemas/room.schema";
import { uploadToCloudinary } from "@/lib/imageUpload/cloudinaryImageUpload";

export async function createRoom(formData: FormData) {
    const amenities = formData.getAll("amenities") as string[];

    const mainImageFile = formData.get("mainImage") as File;

    const subImageFiles = formData.getAll("subImages") as File[];

    const parsed = RoomSchema.safeParse({
        name: formData.get("name"),
        hotelId: formData.get("hotelId"),
        roomType: formData.get("roomType"),
        price: formData.get("price"),
        totalRooms: formData.get("totalRooms"),
        availableRooms: formData.get("availableRooms"),
        amenities,
    });

    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const data = parsed.data;
    let mainImageUrl = '';
    if (mainImageFile && mainImageFile.size > 0) {
        try {
            mainImageUrl = await uploadToCloudinary(mainImageFile);
        } catch (error) {
            return { error: { mainImage: ['Failed to upload main image'] } };
        }
    } else {
        return { error: { mainImage: ['Main image is required'] } };
    }


    const subImageUrls: string[] = [];
    for (const file of subImageFiles) {
        if (file && file.size > 0) {
            try {
                const url = await uploadToCloudinary(file);
                subImageUrls.push(url);
            } catch (error) {
                console.error('Failed to upload sub image:', error);
                // Continue with other images even if one fails
            }
        }
    }


    await prisma.room.create({
        data: {
            name: data.name,
            hotelId: data.hotelId,
            roomType: data.roomType,
            price: parseFloat(data.price),
            total: parseInt(data.totalRooms),
            available: parseInt(data.availableRooms),
            image: mainImageUrl,
            subImage: subImageUrls, // Add this field to your Prisma schema
            amenities: data.amenities || [],
        },
    });

    redirect("/dashboard/hotels");
}

export async function getHotels() {
    return prisma.hotel.findMany({
        select: { id: true, name: true },
    });
}