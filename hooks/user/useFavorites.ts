import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface FavoriteHotel {
  id: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  amenities: string[];
  city: {
    name: string;
    country: { name: string };
  };
  rooms: { price: number }[];
}

interface Favorite {
  id: string;
  userId: string;
  hotelId: string;
  createdAt: string;
  hotel: FavoriteHotel;
}

export const useFavorites = () => {
  return useQuery<Favorite[]>({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/favorites");
      return data;
    },
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: string) => {
      const { data } = await axios.post("/api/user/favorites", { hotelId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: string) => {
      const { data } = await axios.delete(`/api/user/favorites/${hotelId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });
};

export const useIsFavorite = (hotelId: string | undefined) => {
  const { data: favorites } = useFavorites();
  return favorites?.some((f) => f.hotelId === hotelId) ?? false;
};
