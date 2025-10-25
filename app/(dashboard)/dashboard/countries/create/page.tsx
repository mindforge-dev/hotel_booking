"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Globe, Flag, FileImage } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { countrySchema, CountryFormData } from "@/schemas/ country.schema"
import { createCountry } from "@/services/dashboard/country.service"


const CreateCountryPage = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<CountryFormData>({
        resolver: zodResolver(countrySchema)
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const watchedImage = watch("countryImage")


    const onSubmit = async (data: CountryFormData) => {
        try {
            const result = await createCountry(data)
            console.log("Success:", result)

        } catch (error) {
            console.error(error)

        }
    }


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    return (
        <div className="">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-black/10 dark:bg-white/10 rounded-full">
                            <Globe className="h-8 w-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Create New Country</h1>
                    <p className="opacity-70">Add a new country to your collection</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5" />
                            Country Details
                        </CardTitle>
                        <CardDescription className="opacity-70">
                            Fill in the information for the new country
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Country Name */}
                            <div className="space-y-2">
                                <Label htmlFor="countryName" className="font-medium">
                                    Country Name
                                </Label>
                                <Input
                                    id="countryName"
                                    type="text"
                                    {...register("countryName")}
                                    placeholder="Enter country name"
                                    className="placeholder:opacity-50"
                                />
                                {errors.countryName && (
                                    <p className="text-sm text-red-500">{errors.countryName.message}</p>
                                )}
                            </div>

                            {/* Country Code */}
                            <div className="space-y-2">
                                <Label htmlFor="countryCode" className="font-medium">
                                    Country Code
                                </Label>
                                <Input
                                    id="countryCode"
                                    type="text"
                                    {...register("countryCode")}
                                    placeholder="Enter code (e.g., US)"
                                    className="placeholder:opacity-50"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <p className="text-sm opacity-70">
                                    2-3 character country code (ISO format recommended)
                                </p>
                                {errors.countryCode && (
                                    <p className="text-sm text-red-500">{errors.countryCode.message}</p>
                                )}
                            </div>

                            {/* Country Image */}
                            <div className="space-y-2">
                                <Label htmlFor="countryImage" className="font-medium">
                                    Country Flag/Image
                                </Label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="countryImage"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black dark:border-white rounded-lg cursor-pointer bg-white dark:bg-black hover:opacity-80 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-16 h-12 object-cover rounded mb-2"
                                                    />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-2 opacity-60" />
                                                        <p className="text-sm">
                                                            <span className="font-semibold">Click to upload</span> or drag & drop
                                                        </p>
                                                        <p className="text-xs opacity-60">PNG, JPG, WEBP (MAX. 5MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="countryImage"
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg,image/png,image/webp"
                                                {...register("countryImage", {
                                                    onChange: handleImageChange
                                                })}
                                            />
                                        </label>
                                    </div>

                                    {errors.countryImage && (
                                        <p className="text-sm text-red-500">{errors?.countryImage.message as any}</p>
                                    )}

                                    {imagePreview && watchedImage?.[0] && (
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileImage className="h-5 w-5" />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {watchedImage[0].name}
                                                        </p>
                                                        <p className="text-xs opacity-70">
                                                            {(watchedImage[0].size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 hover:opacity-80"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Create Country
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CreateCountryPage