"use client"

import { ArrowLeft, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Hotel, Booking, Review } from "@prisma/client"
import { Room } from "@/types/rooms"

import { HotelWithRelations } from "@/types/hotel";

export default function HotelDetailClient({ hotel }: { hotel: HotelWithRelations | null }) {
  if (!hotel) {
    return <div>Hotel not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/hotels" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Hotels
            </Link>
          </Button>

          <Button asChild>
            <Link href={`/dashboard/hotels/edit/${hotel.id}`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Hotel
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-[300px] object-cover rounded-lg"
            />
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{hotel.name}</h1>

              </div>
              <Badge variant={hotel.featured ? "default" : "secondary"}>
                {hotel.featured ? "Featured" : "Not Featured"}
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="font-semibold">Description</h2>
                <p className="text-muted-foreground mt-1">{hotel.description}</p>
              </div>



              <div>
                <h2 className="font-semibold">Rating</h2>
                <p className="text-yellow-500 font-bold mt-1">{hotel.rating} ★</p>
              </div>

              <div>
                <h2 className="font-semibold">Amenities</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hotel.amenities.map((amenity: string) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold">Created At</h2>
                <p className="text-muted-foreground mt-1">
                  {format(new Date(hotel.createdAt), "PPpp")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Hotel Rooms</h2>
          <Button asChild>
            <Link href={`/dashboard/hotels/${hotel.id}/rooms/new`} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Room
            </Link>
          </Button>
        </div>

        {hotel.rooms.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No rooms available for this hotel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotel.rooms.map((room: Room) => (
              <div key={room.id} className="border rounded-lg overflow-hidden shadow-sm">
                <img
                  src={room.image || '/placeholder-room.jpg'}
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <Badge variant="secondary">
                      ${room.price} / night
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{room.roomType}</Badge>
                    <Badge variant="outline">{room.total} Total</Badge>
                    <Badge variant={room.available > 0 ? "default" : "destructive"}>
                      {room.available} Available
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {room.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="mr-2">
                        • {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/hotels/${hotel.id}/rooms/${room.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/hotels/${hotel.id}/rooms/${room.id}/edit`}>
                        Edit Room
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}