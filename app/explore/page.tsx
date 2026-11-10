"use client";

import { useState, useEffect } from "react";
import { HotelCard } from "../../components/hotels/HotelCard";
import { SearchCandidate } from "../../lib/types/hotel";
import { formatINR } from "../../lib/search/query-builder";
import { cn } from "../../lib/utils";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useState({
    destination: "goa",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined,
    accommodationTypes: [],
    amenities: [],
    keywords: "",
  });

  const [searchResults, setSearchResults] = useState<SearchCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotels, setSelectedHotels] = useState<Set<string>>(new Set());
  const [savedHotels, setSavedHotels] = useState<Set<string>>(new Set());

  // Mock search function - replace with actual discovery engine
  const performSearch = async () => {
    setIsSearching(true);
    setError(null);

    try {
      // Simulate API call
      const mockResults: SearchCandidate[] = [
        {
          id: "1",
          name: "Taj Resort & Spa",
          destination: "goa",
          location: "Calangute Beach",
          propertyType: "resort",
          description: "Luxury beachfront resort with world-class amenities, swimming pools, and spa facilities.",
          sourceTitle: "Taj Resort & Spa - Official Website",
          sourceSnippet: "Taj Resort & Spa offers premium beachfront accommodations with 24/7 room service and world-class dining.",
          sourceUrl: "https://taj.com/goa-resorts",
          sourceDomain: "taj.com",
          sourceKind: "official_website",
          imageUrl: "/images/taj-resort.jpg",
          rating: { value: 4.5, scale: 5, reviewCount: 1234, sourceUrl: "", retrievedAt: "" },
          price: { amount: 8500, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" },
          currency: "INR",
          amenities: ["swimming_pool", "wifi", "air_conditioning", "restaurant"],
          verificationStatus: "official_website_identified",
          discoveredAt: new Date().toISOString(),
          provider: "mock",
          query: "taj resort goa",
          confidence: 0.9,
          bookingUrls: [
            { label: "Booking.com", url: "https://booking.com/taj-goa", platform: "booking.com" },
            { label: "Agoda", url: "https://agoda.com/taj-goa", platform: "agoda" },
          ],
        },
        {
          id: "2",
          name: "Beach Palace Homestay",
          destination: "goa",
          location: "Palolem Beach",
          propertyType: "homestay",
          description: "Cozy homestay with private balcony overlooking the beach, perfect for families.",
          sourceTitle: "Beach Palace Homestay - Travel Blog",
          sourceSnippet: "Beach Palace offers intimate homestay experience with beach access and local cuisine.",
          sourceUrl: "https://example.com/beach-palace",
          sourceDomain: "example.com",
          sourceKind: "travel_article",
          imageUrl: "/images/beach-palace.jpg",
          rating: { value: 4.2, scale: 5, reviewCount: 567, sourceUrl: "", retrievedAt: "" },
          price: { amount: 3200, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" },
          currency: "INR",
          amenities: ["wifi", "breakfast", "beach_access"],
          verificationStatus: "information_unverified",
          discoveredAt: new Date().toISOString(),
          provider: "mock",
          query: "beach palace homestay palolem",
          confidence: 0.7,
          bookingUrls: [],
        },
        {
          id: "3",
          name: "Sunset Resort & Spa",
          destination: "goa",
          location: "Vagator",
          propertyType: "resort",
          description: "Spectacular sunset views from this premium resort with infinity pool and spa facilities.",
          sourceTitle: "Sunset Resort - Official Listings",
          sourceSnippet: "Luxury resort featuring infinity pool, spa services, and stunning sunset views over the Arabian Sea.",
          sourceUrl: "https://example.com/sunset-resort",
          sourceDomain: "example.com",
          sourceKind: "directory_listing",
          imageUrl: "/images/sunset-resort.jpg",
          price: { amount: 5900, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" },
          currency: "INR",
          amenities: ["swimming_pool", "spa", "air_conditioning", "gym"],
          verificationStatus: "information_unverified",
          discoveredAt: new Date().toISOString(),
          provider: "mock",
          query: "sunset resort vagator",
          confidence: 0.6,
          bookingUrls: [
            { label: "Agoda", url: "https://agoda.com/sunset-vagator", platform: "agoda" },
          ],
        },
      ];

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSearchResults(mockResults);
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSaveToggle = (hotelId: string) => {
    setSavedHotels((prev) => {
      if (prev.has(hotelId)) {
        const newSet = new Set(prev);
        newSet.delete(hotelId);
        return newSet;
      } else {
        return new Set(prev).add(hotelId);
      }
    });
  };

  const handleHotelSelect = (hotelId: string, selected: boolean) => {
    setSelectedHotels((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(hotelId);
      } else {
        newSet.delete(hotelId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <select
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="goa">Goa</option>
                  <option value="manali">Manali</option>
                  <option value="udaipur">Udaipur</option>
                  <option value="jaipur">Jaipur</option>
                  <option value="munnar">Munnar</option>
                  <option value="kerala">Kerala</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Check-in</label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, checkIn: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Check-out</label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, checkOut: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <div className="flex gap-2">
                  <select
                    value={searchParams.adults}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, adults: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    {[1,2,3,4,5].map((n) => (<option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>))}
                  </select>
                  <select
                    value={searchParams.children}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, children: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    {[0,1,2,3,4].map((n) => (<option key={n} value={n}>{n} Child{n > 1 ? 'ren' : ''}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <select
                  value={searchParams.maxBudget || ""}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, maxBudget: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="">Any Budget</option>
                  <option value="1500">Under ₹1,500</option>
                  <option value="3000">₹1,500–₹3,000</option>
                  <option value="5000">₹3,000–₹5,000</option>
                  <option value="8000">₹5,000–₹8,000</option>
                  <option value="15000">₹8,000–₹15,000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accommodation Type</label>
                <select
                  value={searchParams.accommodationTypes[0] || ""}
                  onChange={(e) => setSearchParams((prev) => ({ ...prev, accommodationTypes: e.target.value ? [e.target.value] : [] }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="">Any Type</option>
                  <option value="hotel">Hotels</option>
                  <option value="resort">Resorts</option>
                  <option value="villa">Villas</option>
                  <option value="homestay">Homestays</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? "Searching..." : "Find My Stay"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-serif font-semibold">
              Found {searchResults.length} properties in {searchParams.destination}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-charcoal/70">
                Selected: {selectedHotels.size} hotels
              </span>
              {selectedHotels.size > 0 && (
                <button
                  onClick={() => setSelectedHotels(new Set())}
                  className="text-sm text-forest hover:text-forest/80"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No properties found</h3>
            <p className="text-charcoal/70">Try adjusting your search criteria</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
            <p className="mt-2 text-charcoal/70">Searching for properties...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {searchResults.map((hotel) => (
            <HotelCard
              key={hotel.id}
              candidate={hotel}
              isSelected={selectedHotels.has(hotel.id)}
              onSelect={handleHotelSelect}
              isSaved={savedHotels.has(hotel.id)}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      </section>
    </div>
  );
}