'use client'
import React, { use } from "react";
import { ArrowLeft, Hotel, CalendarDays, User } from "lucide-react";
import { useBooking } from "@/hooks/dashboard/useBooking";
import { calculateTotalPrice, formatDate, formatDateShort, amenityIcons } from "@/lib/bookingUtils";

export default function BookingDetailUI({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: response, isLoading, error } = useBooking(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!response?.booking) return <NotFound />;

  const bookingData = response.booking;
  const totalPrice = calculateTotalPrice(bookingData);
  const nights = Math.ceil(
    (new Date(bookingData.booking.checkOut).getTime() - new Date(bookingData.booking.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
          <button
            className="flex items-center gap-2  hover: transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Bookings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {bookingData.room?.name || 'Room Details'}
              </h1>
              <p className="text-lg">
                {bookingData.room?.roomType || 'N/A'} • ${bookingData.room?.price || 0} per night
              </p>
            </div>

            <div className="relative">
              <img
                src={bookingData.room?.image || '/placeholder-room.jpg'}
                alt={bookingData.room?.name || 'Room'}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${bookingData.booking?.status === 'CONFIRMED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}>
                {bookingData.booking?.status ?
                  bookingData.booking.status.charAt(0).toUpperCase() + bookingData.booking.status.slice(1).toLowerCase()
                  : 'Pending'
                }
              </div>
            </div>

            {/* Amenities Section */}
            <div className="p-6 rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">
                Room Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(bookingData.room?.amenities || []).map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || Hotel;
                  return (
                    <div key={index} className="flex items-center gap-3 text-gray-700">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Availability Section */}
            <div className="p-6 rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold mb-4">
                Availability
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">
                    {bookingData.room?.available || 0}
                  </span> of {bookingData.room?.total || 0} rooms available
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${bookingData.room?.available && bookingData.room?.total ?
                        (bookingData.room.available / bookingData.room.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="space-y-6">
            <div className=" p-6 rounded-xl shadow-sm border sticky top-8">
              <h3 className="text-xl font-semibold  mb-6">
                Booking Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-sm">
                      {bookingData.booking?.checkIn ? formatDateShort(bookingData.booking.checkIn) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-sm">
                      {bookingData.booking?.checkOut ? formatDateShort(bookingData.booking.checkOut) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hotel className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Room Type</p>
                    <p className="text-sm">
                      {bookingData.room?.roomType || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Booking ID</p>
                    <p className="text-sm font-mono">
                      {bookingData.booking?.id ? bookingData.booking.id.slice(-8) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="">
                    ${bookingData.room?.price || 0} × {nights} nights
                  </span>
                  <span className="">
                    ${(bookingData.room?.price || 0) * nights}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">${totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className=" p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold  mb-4">
                Detailed Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Check-in Date:</span>
                  <p className="mt-1">
                    {bookingData.booking?.checkIn ? formatDate(bookingData.booking.checkIn) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Check-out Date:</span>
                  <p className="mt-1">
                    {bookingData.booking?.checkOut ? formatDate(bookingData.booking.checkOut) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Nights:</span>
                  <p className="mt-1">{nights} nights</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Booked on:</span>
                  <p className="mt-1">
                    {bookingData.booking?.createdAt ? formatDate(bookingData.booking.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">
          Booking Not Found
        </h2>
        <p className="text-yellow-600">
          The booking you're looking for doesn't exist or may have been removed.
        </p>
      </div>
    </div>
  );
}