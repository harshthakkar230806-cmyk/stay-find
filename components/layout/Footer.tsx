import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">S</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">StayFinder</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Find your stay. Within your budget. The premium hotel discovery platform for India.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/explore" className="hover:text-gold transition-colors">Explore Stays</Link></li>
              <li><Link href="/destinations" className="hover:text-gold transition-colors">Destinations</Link></li>
              <li><Link href="/assistant" className="hover:text-gold transition-colors">AI Assistant</Link></li>
              <li><Link href="/saved" className="hover:text-gold transition-colors">Saved Stays</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Destinations</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/destinations/goa" className="hover:text-gold transition-colors">Goa</Link></li>
              <li><Link href="/destinations/manali" className="hover:text-gold transition-colors">Manali</Link></li>
              <li><Link href="/destinations/udaipur" className="hover:text-gold transition-colors">Udaipur</Link></li>
              <li><Link href="/destinations/kerala" className="hover:text-gold transition-colors">Kerala</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs mb-2">
            © {new Date().getFullYear()} StayFinder. All rights reserved.
          </p>
          <p className="text-white/30 text-[10px] leading-relaxed max-w-2xl mx-auto">
            StayFinder is a search-discovery platform. We do not provide hotel bookings directly. All information is collected from public sources and should be verified independently.
          </p>
        </div>
      </div>
    </footer>
  );
}