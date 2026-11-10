import Image from "next/image";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { DESTINATIONS } from "../../../lib/types/destination";
import { notFound } from "next/navigation";

interface DestinationPageProps {
  params: {
    slug: string;
  };
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const destination = DESTINATIONS.find((d) => d.slug === params.slug);

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-sand flex items-center justify-center">
          <MapPin className="w-24 h-24 text-sand/60" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <span className="text-white/80 font-medium mb-2">{destination.region}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
            {destination.name}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">{destination.summary}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="lux-card p-6">
              <h2 className="font-serif text-2xl font-semibold mb-4">About {destination.name}</h2>
              <p className="text-charcoal/80 leading-relaxed mb-6">
                {destination.description}
              </p>

              <h3 className="font-serif text-xl font-semibold mb-3">Popular Areas</h3>
              <div className="flex flex-wrap gap-2">
                {destination.popularAreas.map((area) => (
                  <span key={area} className="px-3 py-1 bg-ivory rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </section>

            <section className="lux-card p-6">
              <h2 className="font-serif text-2xl font-semibold mb-4">Budget Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.budgetPresets.map((preset, index) => (
                  <Link
                    key={index}
                    href={`/explore?destination=${destination.slug}&maxBudget=${preset.max || ""}`}
                    className="p-4 border border-border rounded-lg hover:border-forest/50 hover:bg-forest/5 transition-colors text-center"
                  >
                    <div className="font-medium mb-1">{preset.label}</div>
                    <div className="text-xs text-charcoal/60">Find stays</div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="lux-card p-6">
              <h3 className="font-serif text-xl font-semibold mb-4">Search Stays</h3>
              <p className="text-sm text-charcoal/70 mb-6">
                Discover potential properties in {destination.name} using our search-engine discovery system.
              </p>
              <Link
                href={`/explore?destination=${destination.slug}`}
                className="block w-full px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Explore {destination.name} Stays
              </Link>
            </section>

            <section className="lux-card p-6">
              <h3 className="font-serif text-xl font-semibold mb-4">Search Suggestions</h3>
              <ul className="space-y-2">
                {destination.searchSuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Link
                      href={`/explore?destination=${destination.slug}&keywords=${encodeURIComponent(suggestion)}`}
                      className="text-sm text-forest hover:underline flex items-center gap-2"
                    >
                      <span>→</span>
                      <span>{suggestion}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}