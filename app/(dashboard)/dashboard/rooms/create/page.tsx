import { createRoom, getHotels } from "./createRoom";
import { amenitiesList } from "@/data/aminities";
import Form from "next/form";
import ImageUploadClient from "./ImageUploadClient";
import { SubmitButton } from "./SubmitButton";

export const dynamic = 'force-dynamic';

export default async function CreateRoomPage() {
    const hotels = await getHotels();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Create Room</h1>
                <p className="text-muted-foreground">Add a new room to your hotel inventory</p>
            </div>

            <Form action={createRoom} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Hotel select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Hotel</label>
                            <select
                                name="hotelId"
                                className="w-full bg-background border border-border rounded-md p-3"
                                required
                            >
                                <option value="">Select hotel</option>
                                {hotels.map((hotel) => (
                                    <option key={hotel.id} value={hotel.id}>
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Room Name</label>
                            <input
                                name="name"
                                placeholder="e.g. Deluxe Ocean View"
                                className="w-full bg-background border border-border rounded-md p-3"
                                required
                            />
                        </div>

                        {/* Room Type + Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Room Type</label>
                                <select
                                    name="roomType"
                                    className="w-full bg-background border border-border rounded-md p-3"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="SINGLE">Single</option>
                                    <option value="DOUBLE">Double</option>
                                    <option value="TWIN">Twin</option>
                                    <option value="SUITE">Suite</option>
                                    <option value="FAMILY">Family</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Price Per Night ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-background border border-border rounded-md p-3"
                                    required
                                />
                            </div>
                        </div>

                        {/* Total + Available */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Total Rooms</label>
                                <input
                                    type="number"
                                    name="totalRooms"
                                    min="1"
                                    placeholder="0"
                                    className="w-full bg-background border border-border rounded-md p-3"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Available Rooms</label>
                                <input
                                    type="number"
                                    name="availableRooms"
                                    min="0"
                                    placeholder="0"
                                    className="w-full bg-background border border-border rounded-md p-3"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Room Images</label>
                            <ImageUploadClient />
                        </div>

                        {/* Amenities */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Amenities</label>
                            <p className="text-sm text-muted-foreground">
                                Select the amenities available for this room
                            </p>
                            <div className="grid grid-cols-3 gap-3 p-4 border rounded-md">
                                {amenitiesList.map((amenity) => (
                                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="amenities"
                                            value={amenity}
                                            className="form-checkbox h-4 w-4 text-primary bg-background border-border rounded"
                                        />
                                        <span className="text-sm">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3 pt-4 border-t">
                    <SubmitButton />
                </div>
            </Form>
        </div>
    );
}
