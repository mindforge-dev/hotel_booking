import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface LoyaltyData {
  totalPoints: number;
  tier: string;
  nextTier: string | null;
  nextTierPoints: number;
  history: LoyaltyPoint[];
}

interface LoyaltyPoint {
  id: string;
  userId: string;
  points: number;
  description: string;
  source: string;
  bookingId: string | null;
  createdAt: string;
}

export const useLoyalty = () => {
  return useQuery<LoyaltyData>({
    queryKey: ["user-loyalty"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/loyalty");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};
