"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Star,
  Heart,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/user/useUserProfile";
import { useUserBookings } from "@/hooks/user/useUserBookings";
import { useNotifications } from "@/hooks/dashboard/useNotifications";

function StatsCard({
  title,
  value,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="text-muted-foreground text-sm">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

const statusVariant: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: bookingsData, isLoading: bookingsLoading } = useUserBookings();
  const { data: notifications = [], isLoading: notifsLoading } = useNotifications(userId);

  const upcomingBookings = (bookingsData?.bookings || []).filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  ).slice(0, 3);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.name || session?.user?.name || "Guest"} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your bookings
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profileLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Bookings"
              value={profile?._count?.bookings || 0}
              icon={Calendar}
              href="/user/bookings"
              color="bg-blue-100 text-blue-600"
            />
            <StatsCard
              title="Favorites"
              value={profile?._count?.favorites || 0}
              icon={Heart}
              href="/user/favorites"
              color="bg-pink-100 text-pink-600"
            />
            <StatsCard
              title="Loyalty Points"
              value={profile?.loyaltyPoints || 0}
              icon={Star}
              href="/user/loyalty"
              color="bg-amber-100 text-amber-600"
            />
            <StatsCard
              title="Tier"
              value={profile?.loyaltyPoints && profile.loyaltyPoints >= 10000 ? "Platinum" : profile?.loyaltyPoints && profile.loyaltyPoints >= 5000 ? "Gold" : profile?.loyaltyPoints && profile.loyaltyPoints >= 1000 ? "Silver" : "Bronze"}
              icon={Star}
              href="/user/loyalty"
              color="bg-purple-100 text-purple-600"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Stays */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upcoming Stays</CardTitle>
            <Link href="/user/bookings">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={booking.hotel.image}
                        alt={booking.hotel.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.hotel.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{booking.rooms[0]?.room?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={statusVariant[booking.status] || ""} variant="secondary">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No upcoming stays</p>
                <Link href="/hotels">
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Hotels
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Notifications</CardTitle>
            <Link href="/user/notifications">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notifsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notif.isRead ? "bg-background" : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                        notif.isRead ? "bg-muted-foreground" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
