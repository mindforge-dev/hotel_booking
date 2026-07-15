"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

    // Validate main image
    if (!mainImageFile || mainImageFile.size === 0) {
        return { error: { mainImage: ["Main image is required"] } };
    }

    // Upload main image + all sub images in parallel
    const validSubFiles = subImageFiles.filter((f) => f && f.size > 0);

    const [mainImageUrl, subImageResults] = await Promise.all([
        uploadToCloudinary(mainImageFile),
        Promise.allSettled(validSubFiles.map((file) => uploadToCloudinary(file))),
    ]);

    const subImageUrls = subImageResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<string>).value);

    await prisma.room.create({
        data: {
            name: data.name,
            hotelId: data.hotelId,
            roomType: data.roomType,
            price: parseFloat(data.price),
            total: parseInt(data.totalRooms),
            available: parseInt(data.availableRooms),
            image: mainImageUrl,
            subImage: subImageUrls,
            amenities: data.amenities || [],
        },
    });

    revalidatePath("/dashboard/rooms");
    redirect("/dashboard/rooms");
}

export async function getHotels() {
    return prisma.hotel.findMany({
        select: { id: true, name: true },
    });
}
