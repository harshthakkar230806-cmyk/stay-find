"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { SearchCandidate } from "../../lib/types/hotel";
import { cn } from "../../lib/utils";

export default function ComparePage() {
  const [allHotels, setAllHotels] = useState<SearchCandidate[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockHotels: SearchCandidate[] = [
      {
        id: "compare-1",
        name: "Taj Resort & Spa",
        destination: "goa",
        location: "Calangute Beach",
        propertyType: "resort",
        description: "Luxury beachfront resort with world-class amenities.",
        sourceTitle: "Taj Resort - Official",
        sourceSnippet: "Premium resort with swimming pool and spa facilities.",
        sourceUrl: "https://taj.com",
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
        bookingUrls: [],
      },
      {
        id: "compare-2",
        name: "Beach Palace Homestay",
        destination: "goa",
        location: "Palolem Beach",
        propertyType: "homestay",
        description: "Cozy homestay with private balcony overlooking the beach.",
        sourceTitle: "Beach Palace - Travel Blog",
        sourceSnippet: "Intimate homestay experience with beach access.",
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
        id: "compare-3",
        name: "Sunset Resort & Spa",
        destination: "goa",
        location: "Vagator",
        propertyType: "resort",
        description: "Spectacular sunset views with infinity pool and spa.",
        sourceTitle: "Sunset Resort - Listings",
        sourceSnippet: "Luxury resort with infinity pool and spa services.",
        sourceUrl: "https://example.com/sunset-resort",
        sourceDomain: "example.com",
        sourceKind: "directory_listing",
        imageUrl: "/images/sunset-resort.jpg",
        rating: { value: 4.0, scale: 5, reviewCount: 345, sourceUrl: "", retrievedAt: "" },
        price: { amount: 5900, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" },
        currency: "INR",
        amenities: ["swimming_pool", "spa", "air_conditioning", "gym"],
        verificationStatus: "information_unverified",
        discoveredAt: new Date().toISOString(),
        provider: "mock",
        query: "sunset resort vagator",
        confidence: 0.6,
        bookingUrls: [],
      },
    ];

    setAllHotels(mockHotels);
    // Load comparison data from localStorage
    const stored = localStorage.getItem("compareHotels");
    if (stored) {
      try {
        setSelectedHotels(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse comparison hotels", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("compareHotels", JSON.stringify(selectedHotels));

    const comparison = selectedHotels
      .map((id) => allHotels.find((h) => h.id === id))
      .filter((hotel): hotel is SearchCandidate => hotel !== undefined)
      .map((hotel) => {
        const keyMetrics = {
          name: hotel.name,
          price: hotel.price?.amount || 0,
          rating: hotel.rating?.value || 0,
          reviewCount: hotel.rating?.reviewCount || 0,
          propertyType: hotel.propertyType,
          amenities: hotel.amenities || [],
          source: hotel.sourceDomain,
          verificationStatus: hotel.verificationStatus,
        };
        return keyMetrics;
      });

    setComparisonData(comparison);
  }, [selectedHotels, allHotels]);

  const handleHotelSelect = (hotelId: string, selected: boolean) => {
    if (selected) {
      if (selectedHotels.length < 3 && !selectedHotels.includes(hotelId)) {
        setSelectedHotels((prev) => [...prev, hotelId]);
      }
    } else {
      setSelectedHotels((prev) => prev.filter((id) => id !== hotelId));
    }
  };

  const getComparisonValue = (key: string, hotel: any) => {
    switch (key) {
      case "price":
        return hotel.price ? (
          <div>
            <span className="font-semibold">₹{hotel.price.amount.toLocaleString("en-IN")}</span>
            <span className="text-sm text-charcoal/60 ml-1">/night</span>
          </div>
        ) : (
          <span className="text-charcoal/40">On request</span>
        );
      case "rating":
        if (hotel.rating?.value) {
          return (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="font-medium">{hotel.rating.value.toFixed(1)}</span>
              <span className="text-sm text-charcoal/60">({hotel.rating.reviewCount})</span>
            </div>
          );
        }
        return <span className="text-charcoal/40">No rating</span>;
      case "amenities":
        return (
          <div className="flex flex-wrap gap-1">
            {(hotel.amenities || []).slice(0, 3).map((amenity) => (
              <span key={amenity} className="px-2 py-1 bg-ivory rounded-full text-xs">
                {amenity.replace(/_/g, " ")}
              </span>
            ))}
            {(hotel.amenities || []).length > 3 && (
              <span className="px-2 py-1 bg-charcoal/5 rounded-full text-xs">
                +{(hotel.amenities || []).length - 3} more
              </span>
            )}
          </div>
        );
      case "source":
        return (
          <div className="text-sm">
            <div className="font-medium">{hotel.source}</div>
            <div className="text-charcoal/60 text-xs">
              {hotel.verificationStatus.replace(/_/g, " ")}
            </div>
          </div>
        );
      default:
        return <span>{hotel[key as keyof typeof hotel]}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-4xl font-bold mb-8">Compare Properties</h1>

        {selectedHotels.length === 0 ? (
          <div className="lux-card p-8 text-center">
            <h2 className="text-2xl font-medium mb-2">No properties selected for comparison</h2>
            <p className="text-charcoal/70 mb-6">
              Select up to 3 properties to compare them side by side.
            </p>
            <a
              href="/explore"
              className="inline-block px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium"
            >
              Explore Properties
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="lux-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-semibold">Selected Properties ({selectedHotels.length}/3)</h2>
                <button
                  onClick={() => setSelectedHotels([])}
                  className="text-sm text-forest hover:text-forest/80"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allHotels
                  .filter((hotel) => selectedHotels.includes(hotel.id))
                  .map((hotel) => (
                    <div key={hotel.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium line-clamp-2">{hotel.name}</h3>
                        <button
                          onClick={() => handleHotelSelect(hotel.id, false)}
                          className="text-charcoal/60 hover:text-charcoal/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-sm text-charcoal/70 mb-2">
                        {hotel.location}
                      </div>

                      <div className="text-sm font-medium text-forest">
                        {getComparisonValue("price", hotel)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {comparisonData.length > 0 && (
              <div className="lux-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-charcoal/5">
                        <th className="text-left p-4 font-medium">Feature</th>
                        {comparisonData.map((hotel, index) => (
                          <th key={index} className="text-left p-4 font-medium">
                            {hotel.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-4 font-medium">Price</td>
                        {comparisonData.map((hotel, index) => (
                          <td key={index} className="p-4">
                            {getComparisonValue("price", hotel)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 font-medium">Rating</td>
                        {comparisonData.map((hotel, index) => (
                          <td key={index} className="p-4">
                            {getComparisonValue("rating", hotel)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 font-medium">Amenities</td>
                        {comparisonData.map((hotel, index) => (
                          <td key={index} className="p-4">
                            {getComparisonValue("amenities", hotel)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 font-medium">Source</td>
                        {comparisonData.map((hotel, index) => (
                          <td key={index} className="p-4">
                            {getComparisonValue("source", hotel)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}