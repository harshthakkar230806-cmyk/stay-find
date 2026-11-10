"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Save, Trash2, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { SearchCandidate } from "../../lib/types/hotel";
import { useState } from "react";

interface HotelCardProps {
  candidate: SearchCandidate;
  variant?: "default" | "compact" | "detailed";
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  isSaved?: boolean;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export function HotelCard({
  candidate,
  variant = "default",
  isSelected = false,
  onSelect,
  isSaved = false,
  onSaveToggle,
}: HotelCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price?: any) => {
    if (!price) return null;
    const amount = typeof price.amount === "number" ? price.amount : 0;
    const currency = price.currency || "INR";
    const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";
    return `${symbol}${amount.toLocaleString("en-IN")}`;
  };

  const formatRating = (rating?: any) => {
    if (!rating) return null;
    const value = typeof rating.value === "number" ? rating.value : 0;
    const reviewCount = rating.reviewCount || null;
    return { value, reviewCount };
  };

  const getPropertyTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      hotel: "Hotel",
      resort: "Resort",
      villa: "Villa",
      homestay: "Homestay",
      boutique: "Boutique Hotel",
      serviced_apartment: "Serviced Apartment",
      lodge: "Lodge",
      camp: "Camp",
    };
    return type ? labels[type] || type : "Accommodation";
  };

  const getVerificationBadge = () => {
    if (candidate.verificationStatus === "official_website_identified") {
      return {
        icon: "✓",
        text: "Official Website",
        className: "bg-green-50 text-green-700 border-green-200",
      };
    }
    if (candidate.verificationStatus === "information_unverified") {
      return {
        icon: "!",
        text: "Unverified",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }
    return {
      icon: "✓",
      text: "Verified",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  };

  const verificationBadge = getVerificationBadge();

  const compactContent = () => (
    <div className="p-4">
      <div className="flex gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          {candidate.imageUrl && !imageError ? (
            <Image
              src={candidate.imageUrl}
              alt={candidate.name}
              fill
              className="object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-sand rounded-lg flex items-center justify-center">
              <MapPin className="w-8 h-8 text-sand/60" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate mb-1">{candidate.name}</h3>
          <div className="flex items-center gap-1 text-sm text-charcoal/70 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">
              {candidate.destination ? candidate.destination : "Location not specified"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formatRating(candidate.rating) && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span className="text-sm font-medium">
                    {formatRating(candidate.rating)?.value.toFixed(1)}
                  </span>
                  {formatRating(candidate.rating)?.reviewCount && (
                    <span className="text-xs text-charcoal/60">
                      ({formatRating(candidate.rating)?.reviewCount})
                    </span>
                  )}
                </div>
              )}
              <span className="text-xs px-2 py-1 bg-charcoal/5 rounded-full">
                {getPropertyTypeLabel(candidate.propertyType)}
              </span>
            </div>

            <div className="text-right">
              {formatPrice(candidate.price) ? (
                <div className="text-sm font-semibold text-charcoal">
                  {formatPrice(candidate.price)}
                  <span className="text-xs font-normal text-charcoal/60 ml-1">/night</span>
                </div>
              ) : (
                <div className="text-sm text-charcoal/40">Price on request</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onSelect && (
            <button
              onClick={() => onSelect(candidate.id, !isSelected)}
              className={cn(
                "w-8 h-8 rounded-full border transition-colors",
                isSelected
                  ? "bg-forest border-forest text-white"
                  : "border-border hover:border-forest/50"
              )}
            >
              {isSelected && "✓"}
            </button>
          )}

          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(candidate.id, !isSaved)}
              className="w-8 h-8 rounded-full border border-border hover:border-forest/50 transition-colors flex items-center justify-center"
            >
              {isSaved ? (
                <Save className="w-4 h-4 fill-forest text-white" />
              ) : (
                <Save className="w-4 h-4 text-charcoal/60" />
              )}
            </button>
          )}

          <span className={cn("px-2 py-0.5 text-xs rounded-full border", verificationBadge.className)}>
            {verificationBadge.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {candidate.bookingUrls && candidate.bookingUrls.length > 0 && (
            <Link href={candidate.bookingUrls[0].url} target="_blank" rel="noopener noreferrer">
              <button className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors text-sm font-medium flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Book Now
              </button>
            </Link>
          )}

          <Link href={`/hotel/${candidate.id}`}>
            <button className="px-4 py-2 border border-border rounded-lg hover:border-forest/50 hover:bg-forest/5 transition-colors text-sm font-medium">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const defaultContent = () => (
    <div className="lux-card">
      <div className="relative">
        {candidate.imageUrl && !imageError ? (
          <div className="relative h-48 w-full">
            <Image
              src={candidate.imageUrl}
              alt={candidate.name}
              fill
              className="object-cover rounded-t-xl"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-sand flex items-center justify-center">
            <MapPin className="w-16 h-16 text-sand/60" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className={cn("px-2 py-1 text-xs rounded-full border font-medium", verificationBadge.className)}>
            {verificationBadge.text}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-2 line-clamp-2">
          {candidate.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-charcoal/70 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="truncate">
            {candidate.destination ? candidate.destination : "Location not specified"}
          </span>
        </div>

        {candidate.description && (
          <p className="text-sm text-charcoal/80 mb-4 line-clamp-2">
            {candidate.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.rating && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gold/10 rounded-full">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-sm font-medium">
                {formatRating(candidate.rating)?.value.toFixed(1)}
              </span>
              {formatRating(candidate.rating)?.reviewCount && (
                <span className="text-xs text-charcoal/60">
                  ({formatRating(candidate.rating)?.reviewCount})
                </span>
              )}
            </div>
          )}
          <span className="px-3 py-1 bg-charcoal/5 rounded-full text-sm">
            {getPropertyTypeLabel(candidate.propertyType)}
          </span>
          {candidate.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="px-3 py-1 bg-ivory rounded-full text-xs">
              {amenity.replace(/[_]/g, " ")}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          {formatPrice(candidate.price) ? (
            <div className="text-lg font-semibold text-charcoal">
              {formatPrice(candidate.price)}
              <span className="text-sm font-normal text-charcoal/60 ml-1">/night</span>
            </div>
          ) : (
            <div className="text-sm text-charcoal/40">Price on request</div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onSelect && (
              <button
                onClick={() => onSelect(candidate.id, !isSelected)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  isSelected
                    ? "bg-forest border-forest text-white"
                    : "border-border hover:border-forest/50"
                )}
              >
                {isSelected && "✓"}
              </button>
            )}

            {onSaveToggle && (
              <button
                onClick={() => onSaveToggle(candidate.id, !isSaved)}
                className="w-10 h-10 rounded-full border border-border hover:border-forest/50 transition-colors flex items-center justify-center"
              >
                {isSaved ? (
                  <Save className="w-5 h-5 fill-forest text-white" />
                ) : (
                  <Save className="w-5 h-5 text-charcoal/60" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {candidate.bookingUrls && candidate.bookingUrls.length > 0 && (
              <Link href={candidate.bookingUrls[0].url} target="_blank" rel="noopener noreferrer">
                <button className="px-6 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors text-sm font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Book Now
                </button>
              </Link>
            )}

            <Link href={`/hotel/${candidate.id}`}>
              <button className="px-6 py-2 border border-border rounded-lg hover:border-forest/50 hover:bg-forest/5 transition-colors text-sm font-medium">
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return variant === "compact" ? compactContent() : defaultContent();
}