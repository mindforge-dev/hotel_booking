"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { Country } from "@/types/country"
import { City } from "@prisma/client"

import { SearchFiltersProps } from "@/types/search";

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  rating,
  setRating,
  selectedCountryId,
  setSelectedCountryId,
  selectedCityId,
  setSelectedCityId,
}: SearchFiltersProps) {
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await axios.get("/api/locations")
      return response.data
    },
  })



  const availableCities = countries.find((c) => c.id === selectedCountryId)?.cities || []
  console.log('avialiable cities', selectedCityId)

  return (
    <div className="w-full lg:max-w-xs space-y-6 bg-card rounded-lg p-4 lg:sticky lg:top-6 lg:h-fit">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Search</h3>
        <Input
          placeholder="Search hotels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Location</h3>
        <div className="space-y-4">
          <Select
            value={selectedCountryId}
            onValueChange={(value) => {
              setSelectedCountryId(value)
              setSelectedCityId("")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.name} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCityId}
            onValueChange={setSelectedCityId}
            disabled={!selectedCountryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city: City) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Minimum Rating</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant={rating === star ? "default" : "outline"}
              size="sm"
              onClick={() => setRating(rating === star ? 0 : star)}
            >
              {star}
            </Button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="pt-2">
        <Button
          
          variant="outline"
          className="w-full"
          onClick={() => {
            setSearchQuery("")
            setRating(0)
            setSelectedCountryId("")
            setSelectedCityId("")
          }}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
