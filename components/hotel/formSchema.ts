import z from "zod"

export const formSchema = z.object({
    name: z.string().min(2, {
        message: "Hotel name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    country: z.string().min(1, {
        message: "Country is required.",
    }),
    cityId: z.string().min(1, {
        message: "City is required.",
    }),
    image: z.any()
        .refine((file) => file instanceof File || typeof file === 'string', {
            message: "Image is required and must be a file",
        })
        .refine(
            (file) => {
                if (file instanceof File) {
                    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                }
                return true; // Allow string URLs for existing images
            },
            {
                message: "Only .jpg, .png, and .webp formats are supported.",
            }
        )
        .refine(
            (file) => {
                if (file instanceof File) {
                    return file.size <= 5 * 1024 * 1024; // 5MB
                }
                return true; // Allow string URLs for existing images
            },
            {
                message: "Image must be less than 5MB",
            }
        ),
    rating: z.number().min(0).max(5),
    featured: z.boolean().default(false),
    amenities: z.array(z.string()).min(1, {
        message: "Please select at least one amenity.",
    }),
});

