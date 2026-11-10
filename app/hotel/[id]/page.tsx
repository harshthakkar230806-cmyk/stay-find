"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Wifi, Utensils, Waves, Car, Snowflake, Sprout, Dog, Home, Heart, ExternalLink } from "lucide-react";
import { SearchCandidate } from "../../../../lib/types/hotel";
import { cn } from "../../../../lib/utils";

interface HotelDetailPageProps {
  params: {
    id: string;
  };
}

export default function HotelDetailPage({ params }: HotelDetailPageProps) {
  // Mock data - replace with actual data fetching
  const hotel: SearchCandidate = {
    id: params.id,
    name: "Taj Resort & Spa",
    destination: "goa",
    location: "Calangute Beach",
    propertyType: "resort",
    description: "Luxury beachfront resort with world-class amenities, swimming pools, and spa facilities. Our resort offers breathtaking ocean views, premium accommodations, and exceptional service for an unforgettable vacation experience.",
    sourceTitle: "Taj Resort & Spa - Official Website",
    sourceSnippet: "Taj Resort & Spa offers premium beachfront accommodations with 24/7 room service and world-class dining.",
    sourceUrl: "https://taj.com/goa-resorts",
    sourceDomain: "taj.com",
    sourceKind: "official_website",
    imageUrl: "/images/taj-resort.jpg",
    images: [
      { url: "/images/taj-resort-1.jpg", credit: "Hotel", sourceUrl: "" },
      { url: "/images/taj-resort-2.jpg", credit: "Hotel", sourceUrl: "" },
      { url: "/images/taj-resort-3.jpg", credit: "Hotel", sourceUrl: "" },
      { url: "/images/taj-resort-4.jpg", credit: "Hotel", sourceUrl: "" },
    ],
    rating: { value: 4.5, scale: 5, reviewCount: 1234, sourceUrl: "", retrievedAt: "" },
    price: { amount: 8500, currency: "INR", per: "night", label: "per night", sourceUrl: "", retrievedAt: "" },
    currency: "INR",
    amenities: ["swimming_pool", "wifi", "air_conditioning", "restaurant", "spa", "gym", "pet_friendly", "beach_access", "private_pool", "room_service"],
    verificationStatus: "official_website_identified",
    discoveredAt: new Date().toISOString(),
    provider: "mock",
    query: "taj resort goa",
    confidence: 0.9,
    bookingUrls: [
      { label: "Booking.com", url: "https://booking.com/taj-goa", platform: "booking.com" },
      { label: "Agoda", url: "https://agoda.com/taj-goa", platform: "agoda" },
      { label: "MakeMyTrip", url: "https://makemytrip.com/taj-goa", platform: "makemytrip" },
      { label: "Goibibo", url: "https://goibibo.com/taj-goa", platform: "goibibo" },
    ],
  };

  const amenityIcons: Record<string, any> = {
    swimming_pool: Waves,
    wifi: Wifi,
    air_conditioning: Snowflake,
    restaurant: Utensils,
    spa: Heart,
    gym: Sprout,
    pet_friendly: Dog,
    beach_access: Waves,
    private_pool: Waves,
    room_service: Home,
    breakfast: Utensils,
    parking: Car,
    garden: Sprout,
  };

  const formatPrice = (price?: any) => {
    if (!price) return null;
    const amount = typeof price.amount === "number" ? price.amount : 0;
    const currency = price.currency || "INR";
    const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  };

  const getVerificationColor = () => {
    if (hotel.verificationStatus === "official_website_identified") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (hotel.verificationStatus === "information_unverified") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const verificationColor = getVerificationColor();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        {hotel.imageUrl && (
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("px-3 py-1 text-sm rounded-full border font-medium", verificationColor)}>
              {hotel.verificationStatus === "official_website_identified" && "Official Website"}
              {hotel.verificationStatus === "information_unverified" && "Unverified"}
              {hotel.verificationStatus === "source_accessible" && "Source Accessible"}
              {hotel.verificationStatus === "property_identity_supported" && "Property Verified"}
              {hotel.verificationStatus === "information_independently_corroborated" && "Verified"}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-charcoal/10 text-charcoal/70">
              {hotel.propertyType}
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{hotel.location}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.images?.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image.url}
                      alt={`${hotel.name} - Image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-4">About This Property</h2>
              <div className="lux-card p-6">
                <p className="text-charcoal/80 leading-relaxed mb-4">
                  {hotel.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-charcoal/70">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="font-medium">
                      {hotel.rating?.value.toFixed(1)}
                    </span>
                    <span>
                      ({hotel.rating?.reviewCount} reviews)
                    </span>
                  </div>
                  <div>•</div>
                  <div>{hotel.propertyType}</div>
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-4">Amenities</h2>
              <div className="lux-card p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities?.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Waves;
                    return (
                      <div key={amenity} className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-forest" />
                        <span className="text-sm">{amenity.replace(/[_]/g, " ")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Source Information */}
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-4">Source Information</h2>
              <div className="lux-card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Property Information</h3>
                    <p className="text-sm text-charcoal/70">
                      Information collected from: <span className="font-medium">{hotel.sourceTitle}</span>
                    </p>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Source URL: <a href={hotel.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">{hotel.sourceUrl}</a>
                    </p>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Discovered: {new Date(hotel.discoveredAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium mb-2">Information Status</h3>
                    <p className="text-sm text-charcoal/70">
                      This property has been discovered through automated search-engine results.
                      Details may be incomplete or outdated. Always verify directly with the property or booking provider before making any reservations.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <section className="lux-card overflow-hidden">
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-4">Price & Booking</h3>

                {hotel.price && (
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-charcoal">
                      {formatPrice(hotel.price)}
                      <span className="text-lg font-normal text-charcoal/60 ml-1">/night</span>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Source-reported price. May not be current.
                    </p>
                  </div>
                )}

                {hotel.bookingUrls && hotel.bookingUrls.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {hotel.bookingUrls.map((booking, index) => (
                      <Link
                        key={index}
                        href={booking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {booking.label}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span>Property quality not verified by StayFinder</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Card */}
            <section className="lux-card p-6">
              <h3 className="font-serif text-xl font-semibold mb-4">Contact & Location</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Property Type</h4>
                  <p className="text-sm text-charcoal/70">{hotel.propertyType}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-charcoal/70">{hotel.location}, {hotel.destination}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Source</h4>
                  <p className="text-sm text-charcoal/70">{hotel.sourceDomain}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Verification Status</h4>
                  <p className="text-sm text-charcoal/70">{hotel.verificationStatus.replace(/_/g, " ")}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}