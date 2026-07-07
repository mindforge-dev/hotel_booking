"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateBookingStatus } from "@/hooks/dashboard/useBookings";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BookingStatusSelectProps } from "@/types/bookings";

const statusConfig = {
    PENDING: { label: "Pending", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: "Booking Success", variant: "default" as const, color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Denied", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    CANCELLED: { label: "Cancelled", variant: "outline" as const, color: "bg-secondary text-secondary-foreground" },
    COMPLETED: { label: "Completed", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
};

export function BookingStatusSelect({ bookingId, currentStatus }: BookingStatusSelectProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const queryClient = useQueryClient()
    const updateStatusMutation = useUpdateBookingStatus();
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);
        try {
            await updateStatusMutation.mutateAsync({
                bookingId,
                status: newStatus,
            });

            toast({
                title: "Success",
                description: `Booking status updated to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
                variant: "default",
            });

            queryClient.invalidateQueries({
                queryKey: ['bookings']
            })

        } catch (error: any) {
            console.error("Failed to update booking status:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update booking status",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const currentConfig = statusConfig[currentStatus as keyof typeof statusConfig];

    return (
        <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
        >
            <SelectTrigger className="w-[140px]">
                <SelectValue>
                    <Badge
                        variant={currentConfig?.variant || "secondary"}
                        className={`${currentConfig?.color} border-0`}
                    >
                        {isUpdating ? "Updating..." : currentConfig?.label || currentStatus}
                    </Badge>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                        <Badge
                            variant={config.variant}
                            className={`${config.color} border-0`}
                        >
                            {config.label}
                        </Badge>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}