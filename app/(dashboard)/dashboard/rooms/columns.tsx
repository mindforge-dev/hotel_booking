"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Star } from "lucide-react";
import Link from "next/link";

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

// --- Memoized cell components ---

const RoomImageCell = React.memo(({ image, name }: { image: string; name: string }) => (
  <div className="w-16 h-12 rounded-md overflow-hidden bg-muted">
    <img
      src={optimizeCloudinaryUrl(image, 100, 75)}
      alt={name}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
    />
  </div>
));
RoomImageCell.displayName = "RoomImageCell";

const RoomNameCell = React.memo(({ name, roomType }: { name: string; roomType: string }) => (
  <div className="flex flex-col">
    <span className="font-medium">{name}</span>
    <span className="text-sm text-muted-foreground">{roomType}</span>
  </div>
));
RoomNameCell.displayName = "RoomNameCell";

const HotelCell = React.memo(({ hotel }: { hotel: Room["hotel"] }) => (
  <div className="flex items-center gap-2">
    <Link href={`/dashboard/hotels/${hotel.id}`} className="hover:underline">
      {hotel.name}
    </Link>
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="text-sm text-muted-foreground">{hotel.rating}</span>
    </div>
  </div>
));
HotelCell.displayName = "HotelCell";

const PriceCell = React.memo(({ price }: { price: number }) => (
  <div className="font-medium">
    ${price}
    <span className="text-sm text-muted-foreground">/night</span>
  </div>
));
PriceCell.displayName = "PriceCell";

const AvailabilityCell = React.memo(
  ({ available, total }: { available: number; total: number }) => {
    const percentage = (available / total) * 100;
    const isLow = percentage < 30;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {available}/{total}
          </span>
          <Badge
            variant={isLow ? "destructive" : "default"}
            className="text-xs"
          >
            {percentage.toFixed(0)}%
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              isLow ? "bg-red-500" : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
AvailabilityCell.displayName = "AvailabilityCell";

const BookingsCell = React.memo(({ count }: { count: number }) => (
  <Badge variant="outline">{count} bookings</Badge>
));
BookingsCell.displayName = "BookingsCell";

const AmenitiesCell = React.memo(({ amenities }: { amenities: string[] }) => (
  <div className="flex flex-wrap gap-1 max-w-[200px]">
    {amenities.slice(0, 2).map((amenity, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        {amenity}
      </Badge>
    ))}
    {amenities.length > 2 && (
      <Badge variant="outline" className="text-xs">
        +{amenities.length - 2} more
      </Badge>
    )}
  </div>
));
AmenitiesCell.displayName = "AmenitiesCell";

interface ActionsCellProps {
  roomId: string;
  onDelete: (id: string) => void;
}

const ActionsCell = React.memo(({ roomId, onDelete }: ActionsCellProps) => (
  <div className="flex items-center gap-2">
    <Link href={`/dashboard/rooms/${roomId}`}>
      <Button variant="ghost" size="icon">
        <Eye className="h-4 w-4" />
      </Button>
    </Link>
    <Link href={`/dashboard/rooms/edit/${roomId}`}>
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
          onDelete(roomId);
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
));
ActionsCell.displayName = "ActionsCell";

// --- Utility: optimize Cloudinary URLs ---

function optimizeCloudinaryUrl(url: string, width: number, height: number): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("cloudinary")) {
      const pathParts = parsed.pathname.split("/");
      // Find the "upload" segment specifically and insert transform after it
      // e.g. /image/upload/v123/file.jpg -> /image/upload/w_100,h_75,q_auto,f_auto/v123/file.jpg
      const uploadIndex = pathParts.indexOf("upload");
      if (uploadIndex !== -1) {
        const transform = `w_${width},h_${height},q_auto,f_auto`;
        pathParts.splice(uploadIndex + 1, 0, transform);
        parsed.pathname = pathParts.join("/");
        return parsed.toString();
      }
    }
  } catch {
    // Not a valid URL, return as-is
  }
  return url;
}

// --- Column factory ---

export function createColumns(onDelete: (id: string) => void): ColumnDef<Room, unknown>[] {
  return [
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
        <RoomImageCell image={row.original.image} name={row.original.name} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Room Name",
      cell: ({ row }) => (
        <RoomNameCell name={row.original.name} roomType={row.original.roomType} />
      ),
    },
    {
      accessorKey: "hotel.name",
      header: "Hotel",
      cell: ({ row }) => <HotelCell hotel={row.original.hotel} />,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <PriceCell price={row.original.price} />,
    },
    {
      accessorKey: "available",
      header: "Availability",
      cell: ({ row }) => (
        <AvailabilityCell
          available={row.original.available}
          total={row.original.total}
        />
      ),
    },
    {
      accessorKey: "_count.bookings",
      header: "Bookings",
      cell: ({ row }) => <BookingsCell count={row.original._count.bookings} />,
    },
    {
      accessorKey: "amenities",
      header: "Amenities",
      cell: ({ row }) => <AmenitiesCell amenities={row.original.amenities} />,
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCell roomId={row.original.id} onDelete={onDelete} />
      ),
    },
  ];
}
