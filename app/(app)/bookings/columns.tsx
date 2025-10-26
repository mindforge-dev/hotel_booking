"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export interface CustomerBooking {
  id: string;
  hotelId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  hotel: {
    id: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    featured: boolean;
    amenities: string[];
    cityId: string;
    latitude: number;
    longitude: number;
  };
  rooms: Array<{
    id: string;
    bookingId: string;
    roomId: string;
    room: {
      id: string;
      hotelId: string;
      available: number;
      total: number;
      roomType: string;
      amenities: string[];
      image: string;
      price: number;
      name: string;
    };
  }>;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const customerBookingColumns: ColumnDef<CustomerBooking, unknown>[] = [
  {
    accessorKey: "hotel.name",
    header: "Hotel",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <img
          src={row.original.hotel?.image || '/placeholder-hotel.jpg'}
          alt={row.original.hotel?.name || 'Hotel'}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold text-sm">
            {row.original.hotel?.name || 'N/A'}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>Rating: {row.original.hotel?.rating || 'N/A'}/5</span>
          </div>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "checkIn",
    header: "Check-in",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm">
              {!isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "Invalid date"}
            </div>
            <div className="text-xs text-gray-500">
              {!isNaN(date.getTime()) ? format(date, "EEEE") : ""}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "checkOut",
    header: "Check-out",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm">
              {!isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "Invalid date"}
            </div>
            <div className="text-xs text-gray-500">
              {!isNaN(date.getTime()) ? format(date, "EEEE") : ""}
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge
          variant="outline"
          className={`${getStatusColor(status)} font-medium`}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Booked On",
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return (
        <div className="text-sm">
          <div className="font-medium">
            {!isNaN(date.getTime()) ? format(date, "MMM dd, yyyy") : "Invalid date"}
          </div>
          <div className="text-xs text-gray-500">
            {!isNaN(date.getTime()) ? format(date, "h:mm a") : ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "rooms",
    header: "Room(s)",
    cell: ({ row }) => {
      const rooms = row.original.rooms || [];
      if (rooms.length === 0) return <span className="text-gray-500">No rooms</span>;

      return (
        <div className="space-y-1">
          {rooms.slice(0, 2).map((bookingRoom) => (
            <div key={bookingRoom.id} className="text-sm">
              <Link
                href={`/bookings/room/${bookingRoom.room.id}`}
                className="text-primary hover:underline font-medium"
              >
                {bookingRoom.room.name}
              </Link>
              <div className="text-xs text-gray-500">
                {bookingRoom.room.roomType} • ${bookingRoom.room.price}/night
              </div>
            </div>
          ))}
          {rooms.length > 2 && (
            <div className="text-xs text-gray-500">
              +{rooms.length - 2} more room(s)
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      console.log(row)
      return (
        <div className="flex items-center gap-2">
          <Link href={`/bookings/room/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8">
              <Eye className="h-4 w-4 mr-1" />
              View Details

            </Button>
          </Link>
        </div>
      );
    },
  },
];