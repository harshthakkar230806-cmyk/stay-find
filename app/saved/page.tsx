"use client";

import { useState, useEffect } from "react";
import { HotelCard } from "../../components/hotels/HotelCard";
import { SearchCandidate } from "../../lib/types/hotel";

export default function SavedPage() {
  const [savedHotels, setSavedHotels] = useState<SearchCandidate[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const stored = localStorage.getItem("savedHotels");
    if (stored) {
      try {
        setSavedHotels(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved hotels", e);
      }
    }
  }, []);

  const handleSaveToggle = (hotelId: string, saved: boolean) => {
    if (!saved) {
      setSavedHotels((prev) => {
        const newHotels = prev.filter((h) => h.id !== hotelId);
        localStorage.setItem("savedHotels", JSON.stringify(newHotels));
        return newHotels;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-4xl font-bold mb-8">Saved Properties</h1>

        {savedHotels.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-2">No saved properties</h2>
            <p className="text-charcoal/70 mb-6">
              Browse properties and save them for later comparison or booking.
            </p>
            <a
              href="/explore"
              className="inline-block px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium"
            >
              Explore Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                candidate={hotel}
                onSaveToggle={handleSaveToggle}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}