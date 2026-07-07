"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { amenitiesList } from "@/data/aminities";
import { Room } from "@/types/rooms";

export default function EditRoomPage() {
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [currentSubImages, setCurrentSubImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    roomType: "" as string,
    price: "",
    total: "",
    available: "",
    amenities: [] as string[],
    image: "",
    subImage: [] as string[],
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get<{ room: Room }>(`/api/dashboard/hotels/${hotelId}/rooms`);
        const room = data.room || data.rooms?.find((r: Room) => r.id === roomId);

        if (!room) {
          setError("Room not found");
          return;
        }

        setCurrentImage(room.image || "");
        setCurrentSubImages(room.subImage || []);

        setFormData({
          name: room.name || "",
          roomType: room.roomType || "",
          price: String(room.price || ""),
          total: String(room.total || ""),
          available: String(room.available || ""),
          amenities: room.amenities || [],
          image: room.image || "",
          subImage: room.subImage || [],
        });
      } catch {
        setError("Failed to load room data.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchRoom();
  }, [hotelId, roomId]);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await axios.post("/api/upload", fd);
      setFormData((prev) => ({ ...prev, image: data.url }));
      setCurrentImage(data.url);
    } catch {
      alert("Failed to upload image");
    }
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { data } = await axios.post("/api/upload", fd);
        newUrls.push(data.url);
      } catch {
        console.error("Failed to upload sub image");
      }
    }

    const updated = [...formData.subImage, ...newUrls].slice(0, 5);
    setFormData((prev) => ({ ...prev, subImage: updated }));
    setCurrentSubImages(updated);
  };

  const removeSubImage = (index: number) => {
    const updated = formData.subImage.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, subImage: updated }));
    setCurrentSubImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`/api/rooms/${roomId}`, {
        name: formData.name,
        roomType: formData.roomType,
        price: parseFloat(formData.price),
        total: parseInt(formData.total),
        available: parseInt(formData.available),
        amenities: formData.amenities,
        image: formData.image,
        subImage: formData.subImage,
      });

      router.push(`/dashboard/hotels/${hotelId}/rooms`);
    } catch {
      alert("Failed to save room changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto py-10">Loading...</div>;
  if (error) return <div className="container mx-auto py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-background text-foreground p-6 rounded-md shadow">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Edit Room</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-background border border-border rounded-md p-3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={(e) => setFormData((prev) => ({ ...prev, roomType: e.target.value }))}
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
              <label className="block text-sm font-medium mb-1">Price Per Night</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
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
                name="total"
                value={formData.total}
                onChange={(e) => setFormData((prev) => ({ ...prev, total: e.target.value }))}
                min="1"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Available Rooms</label>
              <input
                type="number"
                name="available"
                value={formData.available}
                onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.value }))}
                min="0"
                className="w-full bg-background border border-border rounded-md p-3"
                required
              />
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Main Room Image</label>
            {currentImage && (
              <div className="relative mb-3">
                <img src={currentImage} alt="Current" className="w-full h-48 object-cover rounded-md" />
                <label className="absolute bottom-2 left-2 bg-background text-sm px-2 py-1 rounded shadow cursor-pointer">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            )}
            {!currentImage && (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
                <p className="text-sm font-semibold">Click to upload</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Sub Images */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Images ({currentSubImages.length}/5)
            </label>
            {currentSubImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {currentSubImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt={`Sub ${i + 1}`} className="w-full h-24 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeSubImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            {currentSubImages.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-accent transition-colors">
                <p className="text-sm font-semibold">Add images</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleSubImageUpload} />
              </label>
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
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
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md font-medium text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <a
              href={`/dashboard/hotels/${hotelId}/rooms/${roomId}`}
              className="px-6 py-2 border border-border rounded-md font-medium hover:bg-accent"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
