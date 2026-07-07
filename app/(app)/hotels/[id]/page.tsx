"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft, BedDouble, Users, Check } from "lucide-react";
import BookingModal from "./bookingModel";
import { notFound, useRouter } from "next/navigation";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Hotel } from "@/types/hotel";

export type Room = {
  id: string;
  hotelId: string;
  available: number;
  total: number;
  roomType: "SINGLE" | "DOUBLE" | "TWIN" | "SUITE" | "FAMILY";
  createdAt: string;
  updatedAt: string;
  image: string;
  price: number;
  amenities: string[];
  name: string;
  description?: string;
  maxOccupancy?: number;
  features?: string[];
};

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />,
});

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const hotelCoords: [number, number] = [51.505, -0.09];
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { data, status } = useSession();
  if (!id) return notFound();
  
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
  console.log(hotel,'data in hotel detail page');

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

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
            <span>Back to Hotels</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px]">
            {hotel?.image && (
              <Image
                alt={hotel.id}
                src={hotel.image}
                fill
                className="object-cover rounded-lg"
                priority
              />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {hotel?.city?.name + ", " + hotel?.city?.country?.name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{hotel.rating}</span>
                <span className="text-muted-foreground">
                  ({hotel.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{hotel.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {(hotel.amenities || [])?.map((amenity: string) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Map */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-2xl font-semibold">📍 Location</h2>
            <div className="h-[400px] rounded-xl overflow-hidden border">
              <Map center={hotelCoords} name={hotel.name} location={hotel?.location} />
            </div>
          </div>

          {/* Rooms */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-semibold">🛏️ Available Rooms</h2>
            {hotel?.rooms?.map((room: Room) => (
              <div
                key={room.id}
                className="flex flex-col md:flex-row border rounded-xl p-5 gap-5 shadow-sm bg-card"
              >
                <div className="md:min-w-[160px] w-full md:w-[30%] h-40 relative rounded-lg overflow-hidden">
                  {room?.image ? (
                    <Image
                      src={room.image}
                      alt={room.id}

                      fill
                   
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BedDouble className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="md:flex-1 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <div className="text-primary text-lg font-bold">
                        ${room.price}
                        <span className="text-sm text-muted-foreground font-normal"> / night</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {room.description || "Room details"}
                    </p>
                    <div className="flex gap-4 flex-wrap mt-2 text-sm">
                      <div className="flex items-center gap-1 text-foreground/80">
                        <Users className="h-4 w-4" />
                        Sleeps {room.maxOccupancy || room.available || 2}
                      </div>
                      {room.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {status === "authenticated" && (
                    <div className="mt-4 md:mt-0 md:self-end">
                      <Button
                        className="w-full md:w-auto"
                        onClick={() => handleBookRoom(room)}
                      >
                        Book Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedRoom && (
        <BookingModal
          email={data?.user?.email || ""}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          room={selectedRoom}
          hotelId={id}
          hotelName={hotel.name}
        />
      )}
    </>
  );
}