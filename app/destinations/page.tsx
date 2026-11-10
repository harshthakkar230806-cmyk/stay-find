import Link from "next/link";
import { MapPin } from "lucide-react";
import { DESTINATIONS } from "../../lib/types/destination";

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="font-serif text-4xl font-bold mb-4">Explore Destinations across India</h1>
          <p className="text-charcoal/70">
            From serene beaches to majestic mountains, discover stays in India's most breathtaking locations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="lux-card group overflow-hidden block"
            >
              <div className="relative h-48 bg-sand flex items-center justify-center">
                <MapPin className="w-16 h-16 text-sand/60 group-hover:scale-110 transition-transform" />
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                  {dest.region}
                </div>
              </div>

              <div className="p-6">
                <h2 className="font-serif text-2xl font-semibold mb-2 group-hover:text-forest transition-colors">
                  {dest.name}
                </h2>
                <p className="text-sm text-charcoal/70 mb-4 line-clamp-2">
                  {dest.summary}
                </p>

                <div className="flex flex-wrap gap-1">
                  {dest.popularAreas.slice(0, 3).map((area) => (
                    <span key={area} className="px-2 py-1 bg-ivory rounded-full text-xs text-charcoal/80">
                      {area}
                    </span>
                  ))}
                  {dest.popularAreas.length > 3 && (
                    <span className="px-2 py-1 bg-charcoal/5 rounded-full text-xs text-charcoal/60">
                      +{dest.popularAreas.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}