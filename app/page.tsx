import Link from "next/link";
import { Search, MapPin, Sparkles, Shield, Compass } from "lucide-react";
import { DESTINATIONS } from "../lib/types/destination";

export default function HomePage() {
  const budgetPresets = [
    { label: "Under ₹1,500", max: 1500 },
    { label: "₹1,500–₹3,000", min: 1500, max: 3000 },
    { label: "₹3,000–₹5,000", min: 3000, max: 5000 },
    { label: "₹5,000–₹8,000", min: 5000, max: 8000 },
    { label: "₹8,000–₹15,000", min: 8000, max: 15000 },
    { label: "₹15,000+", min: 15000 },
  ];

  const collections = [
    { name: "Beach Resorts", icon: "🏖️", query: "beach resorts" },
    { name: "Luxury Escapes", icon: "✨", query: "luxury hotels" },
    { name: "Budget Hotels", icon: "💰", query: "budget hotels" },
    { name: "Romantic Stays", icon: "❤️", query: "romantic resorts" },
    { name: "Family Resorts", icon: "👨‍👩‍👧‍👦", query: "family resorts" },
    { name: "Mountain Retreats", icon: "⛰️", query: "mountain retreats" },
    { name: "Private Pool Villas", icon: "🏊", query: "private pool villas" },
    { name: "Weekend Getaways", icon: "🚗", query: "weekend getaways" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 editorial-gradient z-10" />
        <div className="absolute inset-0 bg-sand flex items-center justify-center">
          <MapPin className="w-32 h-32 text-white/10" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide uppercase mb-6 border border-white/20">
            India's Search-Engine Hotel Discovery Platform
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Your next escape starts here.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Discover beautiful stays across India, matched to your budget.
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-xl max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-background rounded-xl border">
              <MapPin className="w-5 h-5 text-forest" />
              <input
                type="text"
                placeholder="Where are you going?"
                className="w-full bg-transparent border-none focus:outline-none text-charcoal text-sm"
              />
            </div>
            <Link href="/explore" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-3 bg-forest text-white rounded-xl hover:bg-forest/90 transition-colors font-medium flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Find My Stay
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Budget Explorer */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl font-bold mb-3">Explore by Budget</h2>
          <p className="text-charcoal/70">Find the perfect stay for your wallet, from cozy homestays to luxury resorts.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {budgetPresets.map((preset, index) => (
            <Link
              key={index}
              href={`/explore?maxBudget=${preset.max || ""}`}
              className="lux-card p-6 text-center hover:border-forest transition-all group"
            >
              <div className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors mb-1">
                {preset.label}
              </div>
              <div className="text-xs text-charcoal/60">View stays</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-white py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-3">Popular Destinations</h2>
              <p className="text-charcoal/70">Explore India's most beloved travel spots.</p>
            </div>
            <Link href="/destinations" className="text-forest font-medium text-sm hover:underline">
              View all destinations →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.slice(0, 4).map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="lux-card group overflow-hidden block"
              >
                <div className="relative h-48 bg-sand flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-sand/60 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                    {dest.region}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-forest transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-charcoal/70 line-clamp-2">
                    {dest.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Collections */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl font-bold mb-3">Popular Collections</h2>
          <p className="text-charcoal/70">Curated discovery categories for your travel style.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {collections.map((col, index) => (
            <Link
              key={index}
              href={`/explore?keywords=${encodeURIComponent(col.query)}`}
              className="lux-card p-6 flex items-center gap-4 hover:border-forest transition-all group"
            >
              <span className="text-3xl">{col.icon}</span>
              <div>
                <h3 className="font-medium text-charcoal group-hover:text-forest transition-colors">
                  {col.name}
                </h3>
                <span className="text-xs text-charcoal/60">Discover stays</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="bg-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-3">How StayFinder Works</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-12">
            We don't use fake databases or inventory. We discover hotels directly through public search results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <Compass className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">Live Discovery</h3>
              <p className="text-sm text-white/60">
                Searches public search engines in real-time to discover properties matching your criteria.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <Shield className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">Source Transparent</h3>
              <p className="text-sm text-white/60">
                Every property links back to its original public source. No fabricated ratings or prices.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">Zero Markup</h3>
              <p className="text-sm text-white/60">
                We don't process bookings or payments. You book directly with official websites or trusted platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}