import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UserBookingRoom {
  room: {
    name: string;
    roomType: string;
    price: number;
  };
}

interface UserBooking {
  id: string;
  hotelId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  createdAt: string;
  hotel: {
    id: string;
    name: string;
    image: string;
  };
  rooms: UserBookingRoom[];
}

interface UserBookingsResponse {
  bookings: UserBooking[];
  total: number;
  page: number;
  totalPages: number;
}

export const useUserBookings = (filters?: { status?: string; page?: number }) => {
  return useQuery<UserBookingsResponse>({
    queryKey: ["user-bookings", filters?.status, filters?.page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters?.page) params.set("page", filters.page.toString());
      const { data } = await axios.get(`/api/user/bookings?${params.toString()}`);
      return data;
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await axios.patch(`/api/user/bookings/${bookingId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
  });
};
