import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Bed, Wifi, Car, Coffee, Tv, Bath, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RoomDetailPageProps {
  params: Promise<{ hotelId: string; roomId: string }>;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  tv: Tv,
  bathroom: Bath,
  bed: Bed,
};

export default async function HotelRoomDetailPage({ params }: RoomDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { hotelId, roomId } = await params;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      hotel: {
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      },
      bookings: {
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!room || room.hotelId !== hotelId) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/hotels/${hotelId}/rooms`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
            <p className="text-muted-foreground">
              {room.hotel.name} &bull; {room.hotel.city?.name}
              {room.hotel.city?.country ? `, ${room.hotel.city.country.name}` : ""}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/hotels/${hotelId}/rooms/${roomId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Room
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Room Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-64 md:h-80">
                <Image
                  src={room.image || "/placeholder-room.jpg"}
                  alt={room.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sub Images */}
          {room.subImage && room.subImage.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {room.subImage.map((img, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="relative h-24">
                      <Image
                        src={img}
                        alt={`${room.name} image ${i + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Room Type:</span>
                <Badge variant="secondary">{room.roomType}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Price per night:</span>
                <span className="text-2xl font-bold text-primary">${room.price}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Availability:</span>
                <span className={`font-medium ${room.available > 0 ? "text-green-600" : "text-red-600"}`}>
                  {room.available} / {room.total} available
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(room.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity.toLowerCase()] || Bed;
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bookings for this Room */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Bookings for this Room ({room.bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {room.bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bookings found for this room.</p>
          ) : (
            <div className="space-y-4">
              {room.bookings.map((bookingRoom) => (
                <div key={bookingRoom.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Booking #{bookingRoom.booking.id.slice(-8)}</span>
                      <span className="text-sm text-muted-foreground">
                        by {bookingRoom.booking.user.name || bookingRoom.booking.user.email}
                      </span>
                    </div>
                    <Badge
                      variant={
                        bookingRoom.booking.status === "CONFIRMED"
                          ? "default"
                          : bookingRoom.booking.status === "PENDING"
                            ? "secondary"
                            : bookingRoom.booking.status === "CANCELLED" ||
                              bookingRoom.booking.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {bookingRoom.booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Check-in:</span>
                      <br />
                      {new Date(bookingRoom.booking.checkIn).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Check-out:</span>
                      <br />
                      {new Date(bookingRoom.booking.checkOut).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Booked:</span>
                      <br />
                      {new Date(bookingRoom.booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Link href={`/dashboard/bookings/${bookingRoom.booking.id}`}>
                      <Button variant="outline" size="sm">
                        View Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
