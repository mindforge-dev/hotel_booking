"use client";

import Link from "next/link";
import { useFavorites, useRemoveFavorite } from "@/hooks/user/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Loader2,
  MapPin,
  Star,
  Trash2,
  Hotel,
} from "lucide-react";

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites();
  const removeMutation = useRemoveFavorite();
  const { toast } = useToast();

  const handleRemove = async (hotelId: string, hotelName: string) => {
    try {
      await removeMutation.mutateAsync(hotelId);
      toast({ title: "Removed", description: `${hotelName} removed from favorites.` });
    } catch {
      toast({ title: "Error", description: "Failed to remove.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites</h1>
        <p className="text-muted-foreground">Hotels you&apos;ve saved for later</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const lowestPrice = fav.hotel.rooms?.length
              ? Math.min(...fav.hotel.rooms.map((r) => r.price))
              : null;

            return (
              <Card key={fav.id} className="overflow-hidden group">
                <div className="relative h-48">
                  <img
                    src={fav.hotel.image}
                    alt={fav.hotel.name}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(fav.hotelId, fav.hotel.name)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold truncate flex-1 mr-2">{fav.hotel.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-sm font-medium">{fav.hotel.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{fav.hotel.city?.name}, {fav.hotel.city?.country?.name}</span>
                  </div>
                  {lowestPrice !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${lowestPrice}<span className="text-sm font-normal text-muted-foreground">/night</span></span>
                      <Link href={`/hotels/${fav.hotelId}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Save hotels you love to easily find them later
            </p>
            <Link href="/hotels">
              <Button>Browse Hotels</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
