"use client";

import { useState } from "react";
import { useUserBookings, useCancelBooking } from "@/hooks/user/useUserBookings";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-800" },
};

const statusTabs = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REJECTED", label: "Rejected" },
];

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { data, isLoading } = useUserBookings({ status: activeTab, page });
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();

  const handleCancel = async (bookingId: string, hotelName: string) => {
    if (!confirm(`Cancel your booking at ${hotelName}?`)) return;

    setCancellingId(bookingId);
    try {
      await cancelMutation.mutateAsync(bookingId);
      toast({ title: "Booking Cancelled", description: `Your booking at ${hotelName} has been cancelled.` });
    } catch {
      toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your reservations</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && data.bookings.length > 0 ? (
        <div className="space-y-4">
          {data.bookings.map((booking) => {
            const config = statusConfig[booking.status] || statusConfig.PENDING;
            const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Hotel image */}
                    <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      <img
                        src={booking.hotel.image}
                        alt={booking.hotel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Booking details */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.hotel.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{booking.rooms[0]?.room?.name || "Room"}</span>
                            {booking.rooms[0]?.room?.price && (
                              <span>• ${booking.rooms[0].room.price}/night</span>
                            )}
                          </div>
                        </div>
                        <Badge className={config.color} variant="secondary">
                          {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(booking.id, booking.hotel.name)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab !== "ALL"
                ? `You don't have any ${activeTab.toLowerCase()} bookings`
                : "You haven't made any bookings yet"}
            </p>
            <a href="/hotels">
              <Button>Browse Hotels</Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
