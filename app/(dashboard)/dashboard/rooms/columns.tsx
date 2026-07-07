"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Star } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Room {
  id: string;
  name: string;
  hotelId: string;
  available: number;
  total: number;
  roomType: string;
  amenities: string[];
  image: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  hotel: {
    id: string;
    name: string;
    rating: number;
  };
  _count: {
    bookings: number;
  };
}

export const columns: ColumnDef<Room, unknown>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-16 h-12 rounded-md overflow-hidden">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-full h-full object-cover"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Room Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.roomType}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "hotel.name",
    header: "Hotel",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link 
          href={`/dashboard/hotels/${row.original.hotel.id}`}
          className="hover:underline"
        >
          {row.original.hotel.name}
        </Link>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-muted-foreground">
            {row.original.hotel.rating}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="font-medium">
        ${row.original.price}
        <span className="text-sm text-muted-foreground">/night</span>
      </div>
    ),
  },
  {
    accessorKey: "available",
    header: "Availability",
    cell: ({ row }) => {
      const availabilityPercentage = (row.original.available / row.original.total) * 100;
      const isLowAvailability = availabilityPercentage < 30;
      
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {row.original.available}/{row.original.total}
            </span>
            <Badge 
              variant={isLowAvailability ? "destructive" : "default"}
              className="text-xs"
            >
              {availabilityPercentage.toFixed(0)}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                isLowAvailability ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.bookings",
    header: "Bookings",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original._count.bookings} bookings
      </Badge>
    ),
  },
  {
    accessorKey: "amenities",
    header: "Amenities",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {row.original.amenities.slice(0, 2).map((amenity, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {amenity}
          </Badge>
        ))}
        {row.original.amenities.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{row.original.amenities.length - 2} more
          </Badge>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const deleteRoom = useMutation({
        mutationFn: async (id: string) => {
          await axios.delete("/api/dashboard/rooms", { data: { ids: [id] } });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard", "rooms"] });
        },
      });

      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/rooms/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/rooms/edit/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this room?")) {
                deleteRoom.mutate(row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];