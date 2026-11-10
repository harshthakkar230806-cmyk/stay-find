import { z } from "zod";

/**
 * Canonical property candidate produced by the discovery layer.
 * Every field is optional and source-backed. Nothing here is invented.
 */

export const SourceKind = z.enum([
  "official_website",
  "booking_platform",
  "travel_article",
  "directory_listing",
  "review_website",
  "general_search",
]);

export type SourceKind = z.infer<typeof SourceKind>;

export const VerificationStatus = z.enum([
  "search_result_only",
  "source_accessible",
  "property_identity_supported",
  "official_website_identified",
  "information_independently_corroborated",
  "information_unverified",
]);

export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const Amenity = z.enum([
  "swimming_pool",
  "wifi",
  "breakfast",
  "parking",
  "air_conditioning",
  "restaurant",
  "spa",
  "gym",
  "pet_friendly",
  "family_friendly",
  "beach_access",
  "private_pool",
  "room_service",
  "bar",
  "concierge",
  "garden",
  "mountain_view",
  "lake_view",
]);

export type Amenity = z.infer<typeof Amenity>;

export const PropertyCategory = z.enum([
  "hotel",
  "resort",
  "villa",
  "homestay",
  "boutique",
  "serviced_apartment",
  "lodge",
  "camp",
]);

export type PropertyCategory = z.infer<typeof PropertyCategory>;

export const Currency = z.enum(["INR", "USD", "EUR", "GBP"]);

export type Currency = z.infer<Currency>;

export const SourceReportedPrice = z.object({
  amount: z.number().nonnegative(),
  currency: Currency.default("INR"),
  per: z.enum(["night", "room", "person", "unknown"]).default("unknown"),
  label: z.string().optional(),
  sourceUrl: z.string().url(),
  retrievedAt: z.string().datetime(),
});

export type SourceReportedPrice = z.infer<typeof SourceReportedPrice>;

export const SourceReportedRating = z.object({
  value: z.number().min(0).max(5),
  scale: z.literal(5),
  reviewCount: z.number().int().nonnegative().optional(),
  sourceUrl: z.string().url(),
  retrievedAt: z.string().datetime(),
});

export type SourceReportedRating = z.infer<SourceReportedRating>;

export const CandidateImage = z.object({
  url: z.string().url(),
  credit: z.string().optional(),
  sourceUrl: z.string().url(),
});

export type CandidateImage = z.infer<CandidateImage>;

export const SearchCandidate = z.object({
  id: z.string(),
  name: z.string().min(1),
  destination: z.string().optional(),
  location: z.string().optional(),
  propertyType: PropertyCategory.optional(),
  description: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourceSnippet: z.string().optional(),
  sourceUrl: z.string().url(),
  sourceDomain: z.string().optional(),
  sourceKind: SourceKind.optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(CandidateImage).optional(),
  rating: SourceReportedRating.optional(),
  price: SourceReportedPrice.optional(),
  currency: Currency.default("INR"),
  amenities: z.array(Amenity).default([]),
  verificationStatus: VerificationStatus.default("information_unverified"),
  discoveredAt: z.string().datetime(),
  provider: z.string(),
  query: z.string().optional(),
  coordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  // booking destinations — only real, relevant URLs
  bookingUrls: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
        platform: z.string(),
      })
    )
    .default([]),
});

export type SearchCandidate = z.infer<SearchCandidate>;

export const SearchRequest = z.object({
  destination: z.string().min(1),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  adults: z.number().int().min(1).default(2),
  children: z.number().int().min(0).default(0),
  rooms: z.number().int().min(1).default(1),
  minBudget: z.number().nonnegative().optional(),
  maxBudget: z.number().nonnegative().optional(),
  budgetCurrency: Currency.default("INR"),
  accommodationTypes: z.array(PropertyCategory).default([]),
  amenities: z.array(Amenity).default([]),
  keywords: z.string().optional(),
  queryLimit: z.number().int().min(1).max(12).default(6),
  timeoutMs: z.number().int().min(2000).max(15000).default(8000),
});

export type SearchRequest = z.infer<SearchRequest>;

export const DiscoveryResult = z.object({
  query: z.string(),
  provider: z.string(),
  status: z.enum(["ok", "unavailable", "blocked", "timeout", "empty"]),
  candidates: z.array(SearchCandidate),
  message: z.string().optional(),
  searchUrl: z.string().url().optional(),
  elapsedMs: z.number().optional(),
});

export type DiscoveryResult = z.infer<DiscoveryResult>;

export const DiscoveryResponse = z.object({
  request: SearchRequest,
  results: z.array(DiscoveryResult),
  candidates: z.array(SearchCandidate),
  ranked: z.array(SearchCandidate),
  providers: z.array(
    z.object({
      name: z.string(),
      status: z.string(),
      searchUrl: z.string().url().optional(),
      message: z.string().optional(),
    })
  ),
  fallbackUsed: z.boolean(),
  message: z.string().optional(),
  generatedAt: z.string().datetime(),
});

export type DiscoveryResponse = z.infer<DiscoveryResponse>;

export const BudgetPreset = z.object({
  label: z.string(),
  min: z.number().nonnegative().optional(),
  max: z.number().nonnegative().optional(),
  currency: Currency.default("INR"),
});

export type BudgetPreset = z.infer<BudgetPreset>;

export const Destination = z.object({
  slug: z.string(),
  name: z.string(),
  region: z.string(),
  summary: z.string(),
  description: z.string(),
  heroImage: z.string(),
  popularAreas: z.array(z.string()),
  budgetPresets: z.array(BudgetPreset),
  propertyCategories: z.array(PropertyCategory),
  searchSuggestions: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type Destination = z.infer<Destination>;