"use client"

import { useState } from "react"
import { SearchFilters } from "@/components/search/SearchFilters"
import { HotelsList } from "@/components/hotels/HotelList"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function HotelsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [rating, setRating] = useState(0)
  const [selectedCountryId, setSelectedCountryId] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")

  return (
    <div className="min-h-screen mt-4 lg:mt-0 p-4 lg:p-6 bg-background text-foreground">
      {/* Mobile: Filter button and drawer */}
      <div className="lg:hidden mb-4 p-4 rounded-lg">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">Filter Hotels</Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-4/5 sm:w-3/5 bg-background p-4">
            <SheetHeader>
              <SheetTitle className="text-foreground text-lg">Filter Hotels</SheetTitle>
            </SheetHeader>

            <div className="mt-4">
              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                rating={rating}
                setRating={setRating}
                selectedCountryId={selectedCountryId}
                setSelectedCountryId={setSelectedCountryId}
                selectedCityId={selectedCityId}
                setSelectedCityId={setSelectedCityId}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block lg:w-1/5 p-4 border-r border-border sticky top-0 h-fit">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            rating={rating}
            setRating={setRating}
            selectedCountryId={selectedCountryId}
            setSelectedCountryId={setSelectedCountryId}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:p-6 mt-4 lg:mt-0">
          <h1 className="text-3xl font-bold mb-6">Our Hotels</h1>
          <HotelsList
            searchQuery={searchQuery}
            rating={rating}
            selectedCountryId={selectedCountryId}
            selectedCityId={selectedCityId}

          />
        </main>
      </div>
    </div>
  )
}
