import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string;
  loyaltyPoints: number;
  _count: {
    bookings: number;
    favorites: number;
    loyaltyPoints: number;
  };
}

export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/profile");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      name?: string;
      email?: string;
      image?: string;
      phoneNumber?: string;
      address?: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      const { data } = await axios.patch("/api/user/profile", profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};
