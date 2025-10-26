"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CreateHotelResponse } from "@/types/hotel";
import { formSchema } from "./formSchema";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import axios from "axios";

const amenitiesOptions = [
  "Free WiFi",
  "Parking",
  "Pool",
  "Spa",
  "Restaurant",
  "Room Service",
  "Fitness Center",
  "Bar",
  "Air Conditioning",
];

export default function CreateHotelForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      country: "",
      cityId: "",
      image: "",
      rating: 0,
      featured: false,
      amenities: [],
    },
  });

  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  type City = { id: string; name: string };
  type Country = { id: string; name: string; cities: City[] };

  const { data: locations, isLoading } = useQuery<Country[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await axios.get("/api/locations");
      return response.data;
    },
  });

  const availableCities =
    locations?.find((c) => c.id === selectedCountryId)?.cities || [];

  const createHotel = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        const formData = new FormData();

        // Handle image - first upload it if it's a File
        let imageUrl = values.image;
        if (values.image instanceof File) {
          const imageFormData = new FormData();
          imageFormData.append('file', values.image);

          const uploadResponse = await axios.post('/api/upload', imageFormData);
          if (!uploadResponse.data?.url) {
            throw new Error('Failed to upload image');
          }
          imageUrl = uploadResponse.data.url;
        }

        // Append all form fields
        formData.append('image', imageUrl);
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('country', values.country);
        formData.append('cityId', values.cityId);
        formData.append('rating', values.rating.toString());
        formData.append('featured', values.featured.toString());
        formData.append('amenities', JSON.stringify(values.amenities));

        const { data } = await axios.post<CreateHotelResponse>(
          "/api/hotels",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        return data;
      } catch (error) {
        console.error('Error in createHotel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      form.reset();
      setImagePreview(null);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        console.error("Error creating hotel:", error.response?.data);
      }
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createHotel.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter hotel name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    placeholder="Enter rating"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter hotel description"
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-sm text-muted-foreground">Loading locations...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCountryId(value);
                      form.setValue("cityId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedCountryId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel Image</FormLabel>
              <FormDescription>Upload a high-quality image to showcase your hotel</FormDescription>
              <FormControl>
                <div className="mt-2 space-y-4">
                  <label className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 ${imagePreview ? 'border-muted' : 'border-primary/20 hover:border-primary/50'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Create local preview
                        const local = URL.createObjectURL(file);
                        setImagePreview(local);

                        // Store the actual file object in the form
                        field.onChange(file);
                      }}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="text-sm font-medium">Click to upload</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB)</span>
                    </div>
                  </label>

                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border aspect-video">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          field.onChange('');
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured</FormLabel>
                <FormDescription>
                  Show this hotel on the featured section
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Amenities</FormLabel>
                <FormDescription>
                  Select the amenities available at this hotel
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-background/50 p-4 rounded-lg border">
                {amenitiesOptions.map((amenity) => (
                  <FormField
                    key={amenity}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(amenity)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, amenity])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== amenity,
                                    ),
                                  );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {amenity}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={createHotel.isPending}>
            {createHotel.isPending ? "Creating..." : "Create Hotel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
