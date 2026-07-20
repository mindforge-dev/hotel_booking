"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BedDouble,
  Users,
  Check,
  ShieldCheck,
  Coffee,
  Tv,
  Wifi,
  Wind,
  Sparkles,
} from "lucide-react";
import BookingModal from "../bookingModel";
import { notFound, useRouter } from "next/navigation";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Hotel } from "@/types/hotel";
import { Room } from "@/types/rooms";
import LightboxGallery from "@/components/LightboxGallery";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id, roomId } = unwrappedParams;
  const { data: session, status } = useSession();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch hotel details (which includes all rooms)
  const {
    data: hotel,
    isLoading,
    error,
  } = useQuery<Hotel>({
    queryKey: ["hotels", id],
    queryFn: async () => {
      const response = await axios.get(`/api/hotels/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !hotel) return notFound();

  // Find the specific room
  const room = hotel.rooms?.find((r: Room) => r.id === roomId);
  if (!room) return notFound();

  // Combine image and subImages for the Lightbox Gallery
  const allImages = [room.image, ...(room.subImage || [])].filter(Boolean);

  // Helper to map amenity strings to icons
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="h-5 w-5 text-blue-500" />;
    if (lower.includes("breakfast") || lower.includes("coffee") || lower.includes("food"))
      return <Coffee className="h-5 w-5 text-amber-600" />;
    if (lower.includes("tv") || lower.includes("television"))
      return <Tv className="h-5 w-5 text-indigo-500" />;
    if (lower.includes("ac") || lower.includes("air condition") || lower.includes("cooling"))
      return <Wind className="h-5 w-5 text-teal-500" />;
    return <Sparkles className="h-5 w-5 text-purple-500" />;
  };

  return (
    <>
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Hotel Details</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-6">
          <Badge className="mb-2" variant="outline">
            {room.roomType} Room
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">{room.name}</h1>
          <p className="text-muted-foreground mt-1">
            Located at <span className="font-semibold text-foreground">{hotel.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Images & Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-xl overflow-hidden shadow-md bg-muted">
              <LightboxGallery images={allImages} />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Room Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {room.description ||
                  `Experience premium comfort in our ${room.name}. This room is meticulously designed with modern amenities to ensure a relaxing and memorable stay.`}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.amenities?.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 shadow-sm"
                  >
                    {getAmenityIcon(amenity)}
                    <span className="font-medium text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {room.features && room.features.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Highlights</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {room.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-foreground/95">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pricing & Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 border rounded-xl p-6 shadow-lg bg-card space-y-6">
              <div>
                <div className="text-3xl font-extrabold text-primary flex items-baseline">
                  ${room.price}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ night</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>Free cancellation up to 24 hours before check-in</span>
                </div>
              </div>

              <hr />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BedDouble className="h-4 w-4" /> Capacity
                  </span>
                  <span className="font-semibold">
                    Sleeps {room.maxOccupancy || room.available || 2}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" /> Available Rooms
                  </span>
                  <span className="font-semibold">
                    {room.available} of {room.total} remaining
                  </span>
                </div>
              </div>

              {status === "authenticated" ? (
                <Button
                  className="w-full text-md py-6 font-semibold"
                  onClick={() => setIsBookingModalOpen(true)}
                  disabled={room.available <= 0}
                >
                  {room.available > 0 ? "Book Room Now" : "Fully Booked"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-md py-6 font-semibold"
                    onClick={() => router.push("/auth/login")}
                  >
                    Log In to Book
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    An account is required to place reservations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal
          email={session?.user?.email || ""}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          room={room}
          hotelId={id}
          hotelName={hotel.name}
        />
      )}
    </>
  );
}
