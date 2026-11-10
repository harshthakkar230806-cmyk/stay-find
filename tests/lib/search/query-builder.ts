import { SearchRequest } from "../types/hotel";
import { DESTINATIONS } from "../types/destination";

export interface BuiltQuery {
  query: string;
  intent: string;
  focus: "general" | "price" | "amenity" | "official" | "review";
}

/**
 * Deterministic query generator.
 * Produces a bounded, focused set of queries per search request.
 * No more than `request.queryLimit` queries are returned.
 */
export function buildSearchQueries(request: SearchRequest): BuiltQuery[] {
  const dest = DESTINATIONS.find((d) => d.slug === request.destination) ?? null;
  const destName = dest ? dest.name : request.destination;
  const queries: BuiltQuery[] = [];

  const push = (q: string, intent: string, focus: BuiltQuery["focus"]) => {
    const trimmed = q.trim();
    if (trimmed.length > 0) queries.push({ query: trimmed, intent, focus });
  };

  // 1. General discovery
  push(`hotels in ${destName}`, "general hotel discovery", "general");

  // 2. Accommodation-type focused
  const types = request.accommodationTypes.length
    ? request.accommodationTypes
    : (dest?.propertyCategories ?? ["hotel", "resort"]);
  for (const t of types.slice(0, 2)) {
    const label = typeLabel(t);
    push(`${label} in ${destName}`, `${label} discovery`, "general");
  }

  // 3. Budget-focused
  if (request.maxBudget != null) {
    push(
      `${typeLabel(types[0] ?? "hotel")} in ${destName} under ${formatINR(request.maxBudget)}`,
      "budget discovery",
      "price"
    );
  }
  if (request.minBudget != null && request.maxBudget == null) {
    push(
      `${typeLabel(types[0] ?? "hotel")} in ${destName} from ${formatINR(request.minBudget)}`,
      "budget discovery",
      "price"
    );
  }

  // 4. Amenity-focused (top requested amenities only)
  for (const amenity of request.amenities.slice(0, 2)) {
    push(
      `${typeLabel(types[0] ?? "resort")} in ${destName} with ${amenityLabel(amenity)}`,
      "amenity discovery",
      "amenity"
    );
  }

  // 5. Official / direct websites
  push(
    `official hotel websites in ${destName}`,
    "official property websites",
    "official"
  );

  // 6. Review / best-of
  push(
    `best ${typeLabel(types[0] ?? "hotel")} in ${destName} reviews`,
    "review and ratings",
    "review"
  );

  // 7. Keyword augmentation
  if (request.keywords && request.keywords.trim().length > 0) {
    push(
      `${request.keywords.trim()} in ${destName}`,
      "keyword discovery",
      "general"
    );
  }

  // 8. Date-aware (only if both dates present)
  if (request.checkIn && request.checkOut) {
    push(
      `${typeLabel(types[0] ?? "hotel")} in ${destName} ${request.checkIn} ${request.checkOut}`,
      "date-aware discovery",
      "general"
    );
  }

  return queries.slice(0, request.queryLimit);
}

export function typeLabel(t: string): string {
  switch (t) {
    case "hotel":
      return "hotels";
    case "resort":
      return "resorts";
    case "villa":
      return "villas";
    case "homestay":
      return "homestays";
    case "boutique":
      return "boutique hotels";
    case "serviced_apartment":
      return "serviced apartments";
    case "lodge":
      return "lodges";
    case "camp":
      return "camps";
    default:
      return `${t}s`;
  }
}

export function amenityLabel(a: string): string {
  switch (a) {
    case "swimming_pool":
      return "swimming pool";
    case "wifi":
      return "wifi";
    case "breakfast":
      return "breakfast";
    case "parking":
      return "parking";
    case "air_conditioning":
      return "air conditioning";
    case "restaurant":
      return "restaurant";
    case "spa":
      return "spa";
    case "gym":
      return "gym";
    case "pet_friendly":
      return "pet friendly";
    case "family_friendly":
      return "family friendly";
    case "beach_access":
      return "beach access";
    case "private_pool":
      return "private pool";
    case "room_service":
      return "room service";
    case "bar":
      return "bar";
    case "concierge":
      return "concierge";
    case "garden":
      return "garden";
    case "mountain_view":
      return "mountain view";
    case "lake_view":
      return "lake view";
    default:
      return a.replace(/_/g, " ");
  }
}

export function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const crore = abs / 10000000;
  const lakh = abs / 100000;
  if (crore >= 1) return `₹${crore.toFixed(crore >= 10 ? 0 : 1)} crore`;
  if (lakh >= 1) return `₹${lakh.toFixed(lakh >= 10 ? 0 : 1)} lakh`;
  if (abs >= 1000) {
    return `₹${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  }
  return `₹${abs}`;
}

export function buildSearchUrl(
  provider: string,
  query: string
): string {
  const q = encodeURIComponent(query);
  switch (provider) {
    case "duckduckgo":
      return `https://duckduckgo.com/?q=${q}&ia=web`;
    case "brave":
      return `https://search.brave.com/search?q=${q}`;
    case "bing":
      return `https://www.bing.com/search?q=${q}`;
    case "mojeek":
      return `https://www.mojeek.com/search?q=${q}`;
    case "searchmeme":
      return `https://www.searchmeme.com/search?q=${q}`;
    case "wikipedia":
      return `https://en.wikipedia.org/w/index.php?search=${q}`;
    default:
      return `https://www.google.com/search?q=${q}`;
  }
}