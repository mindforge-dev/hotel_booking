import z from "zod";

export const RoomSchema = z.object({
    hotelId: z.string().min(1),
    name: z.string(),
    roomType: z.enum(["SINGLE", "DOUBLE", "TWIN", "SUITE", "FAMILY"]),
    price: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Price must be a number",
    }),
    totalRooms: z.string().refine((val) => !isNaN(Number(val))),
    availableRooms: z.string().refine((val) => !isNaN(Number(val))),
    amenities: z.array(z.string()).optional(),
});