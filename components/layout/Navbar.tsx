"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Search, Heart, LayoutGrid, Info, MessageSquare } from "lucide-react";
import { cn } from "../../lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: LayoutGrid },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/destinations", label: "Destinations", icon: MapPin },
    { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
    { href: "/saved", label: "Saved", icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-xl">S</span>
          </div>
          <span className="font-serif font-bold text-xl tracking-tight hidden sm:block">
            StayFinder
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-forest",
                  isActive ? "text-forest" : "text-charcoal/70"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/explore">
            <button className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors text-sm font-medium">
              Find My Stay
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}