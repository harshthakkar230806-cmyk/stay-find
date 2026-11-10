"use client";

import { useState } from "react";
import { SearchCandidate } from "../../lib/types/hotel";

export default function AssistantPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [results, setResults] = useState<SearchCandidate[] | null>(null);
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSearchUrl(null);

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple parsing of user request
      const parsed = parseUserRequest(userMessage);

      if (parsed.action === "search") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I found ${parsed.count} potential properties in ${parsed.destination} under ₹${parsed.budget}. Here are the top matches:",
          },
        ]);

        // Mock results based on parsed request
        const mockResults: SearchCandidate[] = generateMockResults(
          parsed.destination,
          parsed.budget,
          parsed.amenities
        );

        setResults(mockResults);
      } else if (parsed.action === "fallback") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: parsed.message,
          },
        ]);
        setSearchUrl(parsed.searchUrl);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm not sure how to help with that request. Could you try asking for a hotel search with a destination, budget, and optional amenities?",
          },
        ]);
      }
    } catch (err) {
      setError("Sorry, I encountered an error. Please try again.");
      console.error("Assistant error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-4xl font-bold mb-8">AI Travel Assistant</h1>

        <div className="lux-card p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ask me about your travel needs</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., 'Find me a romantic resort in Goa under ₹4,000 with a swimming pool and beach access'"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20 min-h-[80px]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching..." : "Ask AI Assistant"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="space-y-4 mb-8">
            {messages.map((msg, index) => (
              <div key={index} className={cn("p-4 rounded-lg", msg.role === "user" ? "bg-forest/10 ml-8" : "bg-gold/10 mr-8")}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  candidate={hotel}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}

        {searchUrl && (
          <div className="lux-card p-6 mt-8">
            <h3 className="font-serif text-xl font-semibold mb-2">Search Unavailable - Manual Search Required</h3>
            <p className="text-charcoal/70 mb-4">
              Automated search is temporarily unavailable. Click below to open the search in your browser:
            </p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open Search in Browser
            </a>
          </div>
        )}

        <div className="lux-card p-6 mt-8 bg-ivory/50">
          <h3 className="font-serif text-xl font-semibold mb-2">How I Can Help</h3>
          <ul className="space-y-2 text-charcoal/70">
            <li>• Find properties in specific destinations (e.g., "Goa", "Manali", "Udaipur")</li>
            <li>• Set budget ranges (e.g., "under ₹5,000", "between ₹2,000-4,000")</li>
            <li>• Find specific amenities (e.g., "swimming pool", "beach access", "spa")</li>
            <li>• Search by accommodation type (e.g., "hotels", "resorts", "villas", "homestays")</li>
            <li>• Find romantic getaways, family-friendly options, or adventure destinations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function parseUserRequest(input: string): any {
  const text = input.toLowerCase();

  // Extract destination
  const destinations = ["goa", "manali", "udaipur", "jaipur", "rishikesh", "munnar", "kerala", "mumbai", "lonavala", "shimla", "ooty", "coorg"];
  const foundDestination = destinations.find((dest) => text.includes(dest));

  // Extract budget
  const budgetMatch = text.match(/under\s*₹?(\d+)/);
  const betweenMatch = text.match(/between\s*₹?(\d+)\s*(?:to|-|and)\s*₹?(\d+)/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : betweenMatch ? Number(betweenMatch[2]) : undefined;

  // Extract amenities
  const amenityKeywords = ["swimming pool", "wifi", "beach access", "spa", "gym", "air conditioning", "restaurant", "parking", "romantic", "family", "pet friendly", "private pool"];
  const foundAmenities = amenityKeywords.filter((amenity) => text.includes(amenity));

  // Extract accommodation type
  const accommodationTypes = ["hotel", "resort", "villa", "homestay", "boutique", "lodge"];
  const foundAccommodation = accommodationTypes.find((type) => text.includes(type));

  if (foundDestination) {
    if (budget && budget > 50000) {
      return {
        action: "fallback",
        message: `I found a search for properties in ${foundDestination} under ₹${budget}, but automated search is temporarily unavailable for this request due to provider restrictions. You can try the manual search I've provided below.",
        searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${foundDestination} hotels under ₹${budget}`)}`,
      };
    }

    return {
      action: "search",
      destination: foundDestination,
      budget,
      amenities: foundAmenities,
      count: 12,
    };
  }

  return {
    action: "search",
    destination: "goa",
    budget: undefined,
    amenities: [],
    count: 8,
  };
}

function generateMockResults(destination: string, budget?: number, amenities: string[] = []): SearchCandidate[] {
  const mockHotels: SearchCandidate[] = [
    {
      id: "mock-1",
      name: `${destination.charAt(0).toUpperCase() + destination.slice(1)} Grand Resort`,
      destination,
      location: destination.charAt(0).toUpperCase() + destination.slice(1) + " Beach",
      propertyType: "resort",
      description: `Premium resort in ${destination} with stunning views and world-class facilities.",
      sourceTitle: `Google Search - ${destination} hotels",
      sourceSnippet: `${destination.charAt(0).toUpperCase() + destination.slice(1)} Grand Resort - Luxury accommodations in ${destination}.",
      sourceUrl: `https://example.com/${destination}-grand-resort`,
      sourceDomain: "example.com",
      sourceKind: "directory_listing",
      imageUrl: `/images/${destination}-hotel-1.jpg`,
      rating: { value: 4.5, scale: 5, reviewCount: 500, sourceUrl: "", retrievedAt: "" },
      price: budget ? { amount: budget * 0.8, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" } : undefined,
      currency: "INR",
      amenities: ["swimming_pool", "wifi", "air_conditioning", "restaurant"],
      verificationStatus: "information_unverified",
      discoveredAt: new Date().toISOString(),
      provider: "mock",
      query: `${destination} hotels`,
      confidence: 0.7,
      bookingUrls: [],
    },
    {
      id: "mock-2",
      name: `${destination.charAt(0).toUpperCase() + destination.slice(1)} Beach Homestay`,
      destination,
      location: `${destination.charAt(0).toUpperCase() + destination.slice(1)} Coast`,
      propertyType: "homestay",
      description: `Cozy beachfront homestay in ${destination} for an authentic experience.",
      sourceTitle: `TripAdvisor - ${destination} homestays`,
      sourceSnippet: `Best homestay in ${destination} with beach access and local cuisine.",
      sourceUrl: `https://example.com/${destination}-beach-homestay`,
      sourceDomain: "example.com",
      sourceKind: "review_website",
      imageUrl: `/images/${destination}-homestay.jpg`,
      rating: { value: 4.2, scale: 5, reviewCount: 200, sourceUrl: "", retrievedAt: "" },
      price: budget ? { amount: budget * 0.6, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" } : undefined,
      currency: "INR",
      amenities: ["wifi", "breakfast", "beach_access"],
      verificationStatus: "information_unverified",
      discoveredAt: new Date().toISOString(),
      provider: "mock",
      query: `${destination} homestay`,
      confidence: 0.6,
      bookingUrls: [],
    },
  ];

  return mockHotels.filter((hotel) => {
    if (budget && hotel.price && hotel.price.amount > budget) return false;
    return true;
  });
}