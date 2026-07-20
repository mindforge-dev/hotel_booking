"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Upload, Save, Loader2, RefreshCw } from "lucide-react"

// Define the validation schema
const bannerSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required").url("Must be a valid URL"),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  subtitle: z.string().min(1, "Subtitle is required").max(200, "Subtitle cannot exceed 200 characters"),
})

type BannerFormValues = z.infer<typeof bannerSchema>

export default function BannerSettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)

  // Initialize react-hook-form
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      imageUrl: "",
      title: "",
      subtitle: "",
    },
  })

  // Watch fields for live preview
  const watchedImageUrl = form.watch("imageUrl")
  const watchedTitle = form.watch("title")
  const watchedSubtitle = form.watch("subtitle")

  // Fetch current banner settings
  const { data: currentBanner, isLoading: isFetchLoading } = useQuery<BannerFormValues>({
    queryKey: ["homeBanner"],
    queryFn: async () => {
      const response = await axios.get("/api/banner")
      return response.data
    }
  })

  // Synchronize form states with query results
  useEffect(() => {
    if (currentBanner) {
      form.reset({
        imageUrl: currentBanner.imageUrl || "",
        title: currentBanner.title || "",
        subtitle: currentBanner.subtitle || "",
      })
    }
  }, [currentBanner, form])

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (updatedData: BannerFormValues) => {
      const response = await axios.post("/api/banner", updatedData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeBanner"] })
      toast({
        title: "Success",
        description: "Homepage banner updated successfully!",
        variant: "default"
      })
    },
    onError: (error: any) => {
      console.error("Failed to save banner settings:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update banner settings.",
        variant: "destructive"
      })
    }
  })

  // Handle file upload with backend resizing (1920x600 landscape ratio)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("width", "1920")
    formData.append("height", "600")
    formData.append("fit", "cover")

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (response.data?.url) {
        form.setValue("imageUrl", response.data.url, { shouldValidate: true })
        toast({
          title: "Image Uploaded",
          description: "Banner image uploaded and resized on the server successfully!",
        })
      } else {
        throw new Error("Invalid response schema")
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload banner image.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = (values: BannerFormValues) => {
    saveMutation.mutate(values)
  }

  const handleReset = () => {
    form.reset({
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
      title: "Find Your Perfect Stay Whatever",
      subtitle: "Discover handpicked hotels for your next adventure",
    })
    toast({
      title: "Reset to Default",
      description: "Fields reset to original defaults. Remember to click Save Changes to apply.",
    })
  }

  if (isFetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading banner settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homepage Banner</h1>
        <p className="text-muted-foreground">
          Modify the main hero section of the landing page, including the title, subtitle, and image.
        </p>
      </div>

      {/* Live Preview Section */}
      <Card className="overflow-hidden border bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Live Banner Preview</CardTitle>
          <CardDescription>
            This is how the banner will look at the top of the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[300px] md:h-[400px] w-full bg-slate-900">
            {watchedImageUrl ? (
              <Image
                src={watchedImageUrl}
                alt="Banner Preview"
                fill
                priority
                className="object-cover brightness-50 transition-all duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                No image selected
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
              <h2 className="text-2xl md:text-4xl font-bold text-center max-w-2xl drop-shadow-md">
                {watchedTitle || "Find Your Perfect Stay Whatever"}
              </h2>
              <p className="mt-2 text-sm md:text-lg text-center max-w-xl drop-shadow-sm opacity-90">
                {watchedSubtitle || "Discover handpicked hotels for your next adventure"}
              </p>
              <Button size="sm" className="mt-4 pointer-events-none opacity-80" variant="secondary">
                Search Hotels
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
              <CardDescription>
                Update the text and upload a banner image. Resizing will automatically happen on the server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter title text (e.g. Find Your Perfect Stay)"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Subtitle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter subtitle text (e.g. Discover handpicked hotels)"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload Panel */}
                  <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors bg-muted/5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Uploading & Resizing...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-primary">Click to upload image</span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Large images will be resized to 1920x600 automatically.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct URL input as fallback */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-center space-y-2 p-4 bg-muted/10 rounded-lg border border-dashed">
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Or Use Image URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          You can paste a direct link to an external image or use the uploaded file URL above.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saveMutation.isPending || isUploading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Defaults
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending || isUploading}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
