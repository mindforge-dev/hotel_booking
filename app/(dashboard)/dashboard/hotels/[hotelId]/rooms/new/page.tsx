import { prisma } from "@/lib/prisma";
import { amenitiesList } from "@/data/aminities";
import Form from "next/form";
import { createRoomForHotel } from "./createRoomForHotel";
import ImageUploadClient from "./ImageUploadClient";

interface CreateRoomForHotelPageProps {
  params: Promise<{ hotelId: string }>;
}

export default async function CreateRoomForHotelPage({ params }: CreateRoomForHotelPageProps) {
  const { hotelId } = await params;

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { id: true, name: true },
  });

  if (!hotel) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Hotel not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground p-6 rounded-md shadow">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Create Room</h1>
        <p className="text-muted-foreground mb-6">
          Adding a room to <span className="font-medium text-foreground">{hotel.name}</span>
        </p>

        <Form action={createRoomForHotel} className="space-y-6">
          {/* Hidden hotelId field pre-filled */}
          <input type="hidden" name="hotelId" value={hotel.id} />

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              className="w-full bg-background border border-border rounded-md p-3"
              placeholder="e.g. Deluxe Ocean View"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <select
                name="roomType"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              >
                <option value="">Select room type</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="TWIN">Twin</option>
                <option value="SUITE">Suite</option>
                <option value="FAMILY">Family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Price Per Night
              </label>
              <input
                type="number"
                name="price"
                min="0"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Rooms</label>
              <input
                type="number"
                name="totalRooms"
                min="1"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Available Rooms
              </label>
              <input
                type="number"
                name="availableRooms"
                min="0"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUploadClient />

          <div>
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <p className="text-sm text-muted-foreground mb-2">
              Select the amenities available in this room
            </p>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    className="form-checkbox h-5 w-5 text-primary bg-background border-border"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-white"
            >
              Create Room
            </button>
            <a
              href={`/dashboard/hotels/${hotel.id}/rooms`}
              className="px-6 py-2 border border-border rounded-md font-medium hover:bg-accent"
            >
              Cancel
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
