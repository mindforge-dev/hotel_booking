"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { useHotelsForFilter } from "@/hooks/dashboard/useRooms";
import { RoomsFilterProps } from "@/types/ui";

export function RoomsFilter({ onFilterChange, isLoading }: RoomsFilterProps) {
  const [filters, setFilters] = useState({
    name: "",
    hotelId: "",
    minPrice: "",
    maxPrice: "",
    available: "",
  });

  const { data: hotels = [] } = useHotelsForFilter();

  // Debounce: only fire onFilterChange after 300ms of inactivity
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const apiFilters = {
        ...newFilters,
        minPrice: newFilters.minPrice ? parseFloat(newFilters.minPrice) : undefined,
        maxPrice: newFilters.maxPrice ? parseFloat(newFilters.maxPrice) : undefined,
        available: newFilters.available ? parseInt(newFilters.available) : undefined,
        hotelId: newFilters.hotelId || undefined,
        name: newFilters.name || undefined,
      };

      // Remove undefined values
      Object.keys(apiFilters).forEach((key) => {
        if (apiFilters[key as keyof typeof apiFilters] === undefined) {
          delete apiFilters[key as keyof typeof apiFilters];
        }
      });

      onFilterChange(apiFilters);
    }, 300);
  };

  const clearFilters = () => {
    const emptyFilters = {
      name: "",
      hotelId: "",
      minPrice: "",
      maxPrice: "",
      available: "",
    };
    setFilters(emptyFilters);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filter Rooms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Room Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Search rooms..."
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel">Hotel</Label>
            <Select
              value={filters.hotelId || "all"}
              onValueChange={(value) => handleFilterChange("hotelId", value === "all" ? "" : value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All hotels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hotels</SelectItem>
                {hotels.map((hotel: any) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Max Price Filter */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="$999"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Available Rooms Filter */}
          <div className="space-y-2">
            <Label htmlFor="available">Min Available</Label>
            <Input
              id="available"
              type="number"
              placeholder="0"
              value={filters.available}
              onChange={(e) => handleFilterChange("available", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters || isLoading}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Active filters:</span>
              {filters.name && <span className="bg-primary/10 px-2 py-1 rounded">Name: {filters.name}</span>}
              {filters.hotelId && (
                <span className="bg-primary/10 px-2 py-1 rounded">
                  Hotel: {hotels.find((h: any) => h.id === filters.hotelId)?.name || "Selected"}
                </span>
              )}
              {filters.minPrice && <span className="bg-primary/10 px-2 py-1 rounded">Min: ${filters.minPrice}</span>}
              {filters.maxPrice && <span className="bg-primary/10 px-2 py-1 rounded">Max: ${filters.maxPrice}</span>}
              {filters.available && <span className="bg-primary/10 px-2 py-1 rounded">Available: {filters.available}+</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
