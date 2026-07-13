import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SupportMessage {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useSupportMessages = () => {
  return useQuery<SupportMessage[]>({
    queryKey: ["user-support"],
    queryFn: async () => {
      const { data } = await axios.get("/api/user/support");
      return data;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      const { data } = await axios.post("/api/user/support", { subject, message });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-support"] });
    },
  });
};
