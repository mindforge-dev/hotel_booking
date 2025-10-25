import z from "zod"
export const countrySchema = z.object({
    countryName: z.string().min(1, "Country name is required"),
    countryCode: z.string()
        .min(2, "Country code must be at least 2 characters")
        .max(3, "Country code must be at most 3 characters")
        .regex(/^[A-Z]{2,3}$/, "Country code must be 2-3 uppercase letters"),
    countryImage: z.any()
        .refine((files) => files?.length > 0, "Country image is required")
        .refine((files) => files?.[0]?.size <= 5000000, "Max file size is 5MB")
        .refine(
            (files) => ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
            "Only .jpg, .png, and .webp formats are supported"
        )
})

export type CountryFormData = z.infer<typeof countrySchema>