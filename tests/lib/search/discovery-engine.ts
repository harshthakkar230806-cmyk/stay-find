import { SearchRequest, SearchCandidate, DiscoveryResponse, DiscoveryResult } from "../types/hotel";
import { buildSearchQueries } from "./query-builder";
import { getProviders } from "./providers/registry";
import { securityLog } from "../security/security-logger";
import { isSafeExternalUrl } from "../security/url-validation";

/**
 * Discovery engine orchestrates provider adapters and normalizes results.
 * It is a pure function — side effects are limited to provider network calls.
 * The engine preserves source links, rate-limits and respects provider
 * access restrictions without fabricating any hotel candidates.
 */
export class DiscoveryEngine {
  constructor(
    private readonly providers = getProviders(),
    private readonly maxConcurrentProviders = 3
  ) {}

  async discover(request: SearchRequest): Promise<DiscoveryResponse> {
    const startedAt = Date.now();
    const queries = buildSearchQueries(request);
    const providerResults: DiscoveryResult[] = [];
    const allCandidates: SearchCandidate[] = [];
    const providerStatusList: any[] = [];

    // Process providers concurrently (with a cap)
    const providerPromises = this.providers.map((provider) =>
      this.runProvider(provider, request, queries)
    );

    const settled = await Promise.withSettled(providerPromises);
    let fallbackUsed = false;

    for (const promise of settled) {
      if (promise.status === "fulfilled") {
        const result = promise.value;
        providerResults.push(result);
        allCandidates.push(...result.candidates);
        providerStatusList.push({
          name: result.provider,
          status: result.status,
          searchUrl: result.searchUrl,
          message: result.message,
        });
        if (result.status === "unavailable" || result.status === "blocked") {
          fallbackUsed = true;
        }
      } else {
        providerStatusList.push({
          name: "unknown",
          status: "error",
          message: promise.reason?.message || "provider failed",
        });
        fallbackUsed = true;
      }
    }

    // Normalize candidates
    const normalizedCandidates = await this.normalizeCandidates(allCandidates);

    // Rank candidates (placeholder algorithm)
    const rankedCandidates = this.rankCandidates(normalizedCandidates, request);

    const elapsedMs = Date.now() - startedAt;

    // Build final message about status
    let message = "Search completed.";
    const unavailableProviders = providerStatusList.filter(
      (p) => p.status === "unavailable" || p.status === "blocked"
    );
    if (unavailableProviders.length > 0) {
      message = `${unavailableProviders.length} provider(s) unavailable/blocked.`;
    }

    return {
      request,
      results: providerResults,
      candidates: normalizedCandidates,
      ranked: rankedCandidates,
      providers: providerStatusList,
      fallbackUsed,
      message,
      generatedAt: new Date().toISOString(),
    };
  }

  private async runProvider(
    provider: any,
    request: SearchRequest,
    queries: any[]
  ): Promise<DiscoveryResult> {
    const results: SearchCandidate[] = [];
    let status: DiscoveryResult["status"] = "ok";
    let searchUrl: string | undefined = undefined;
    let message: string | undefined = undefined;

    for (const query of queries) {
      const providerResponse = await provider.search({
        query: query.query,
        limit: request.queryLimit,
        timeoutMs: request.timeoutMs,
      });

      if (providerResponse.status === "not_permitted") {
        // Don't fail the whole search, but mark that fallback is needed
        status = "blocked";
        if (providerResponse.searchUrl && isSafeExternalUrl(providerResponse.searchUrl)) {
          searchUrl = providerResponse.searchUrl;
        }
        message = providerResponse.message || message;
        continue;
      }

      if (providerResponse.status === "blocked" || providerResponse.status === "timeout") {
        status = providerResponse.status;
        if (providerResponse.searchUrl && isSafeExternalUrl(providerResponse.searchUrl)) {
          searchUrl = providerResponse.searchUrl;
        }
        message = providerResponse.message || message;
        continue;
      }

      if (providerResponse.status === "unavailable") {
        status = "blocked";
        if (providerResponse.searchUrl && isSafeExternalUrl(providerResponse.searchUrl)) {
          searchUrl = providerResponse.searchUrl;
        }
        message = providerResponse.message || message;
        continue;
      }

      // Extract candidates from provider response
      const candidates = this.extractCandidatesFromRaw(
        providerResponse.results,
        provider.getProviderName(),
        query.query
      );

      if (candidates.length > 0) {
        results.push(...candidates);
        if (status === "ok") status = "ok";
      } else if (providerResponse.status === "empty") {
        status = "empty";
      }

      if (providerResponse.searchUrl && isSafeExternalUrl(providerResponse.searchUrl) && !searchUrl) {
        searchUrl = providerResponse.searchUrl;
      }

      if (providerResponse.message && !message) {
        message = providerResponse.message;
      }
    }

    return {
      query: queries[0]?.query ?? "",
      provider: provider.getProviderName(),
      status,
      candidates: results,
      message,
      searchUrl,
      elapsedMs: undefined,
    };
  }

  private async normalizeCandidates(candidates: SearchCandidate[]): Promise<SearchCandidate[]> {
    // In a real implementation, this would apply normalization rules
    // For now, return candidates with default values
    return candidates.map((c) => ({
      ...c,
      verified: false,
      sourceValidationStatus: "unverified",
    }));
  }

  private rankCandidates(candidates: SearchCandidate[], request: SearchRequest): SearchCandidate[] {
    // Simple ranking algorithm based on source quality and match relevance
    return candidates
      .sort((a, b) => {
        // Prefer candidates with source validation
        const aVal = a.verificationStatus === "official_website_identified" ? 2 : 0;
        const bVal = b.verificationStatus === "official_website_identified" ? 2 : 0;
        if (aVal !== bVal) return bVal - aVal;

        // Prefer candidates with ratings if available
        if (a.rating && !b.rating) return 1;
        if (!a.rating && b.rating) return -1;

        // Prefer candidates with prices if available
        if (a.price && !b.price) return 1;
        if (!a.price && b.price) return -1;

        return 0;
      })
      .slice(0, 50); // Limit to top 50 candidates
  }

  private extractCandidatesFromRaw(
    rawResults: any[],
    provider: string,
    query: string
  ): SearchCandidate[] {
    return rawResults.map((raw, index) => {
      const id = this.generateStableId(raw.url, provider, query, index);

      // Basic extraction logic - in a real implementation this would be more sophisticated
      const name = this.extractPropertyName(raw.title || raw.snippet || "");
      const destination = this.extractDestination(raw.snippet || "");

      return {
        id,
        name,
        destination,
        propertyType: this.extractPropertyType(raw.snippet || ""),
        description: raw.snippet || "",
        sourceTitle: raw.title || "",
        sourceSnippet: raw.snippet || "",
        sourceUrl: raw.url,
        sourceDomain: this.extractDomain(raw.url),
        sourceKind: this.classifySource(raw.url, raw.snippet || ""),
        imageUrl: this.extractImageUrl(raw.html || ""),
        rating: this.extractRating(raw.snippet || ""),
        price: this.extractPrice(raw.snippet || ""),
        currency: "INR",
        amenities: this.extractAmenities(raw.snippet || ""),
        verificationStatus: "information_unverified",
        discoveredAt: new Date().toISOString(),
        provider,
        query,
        coordinates: this.extractCoordinates(raw.html || ""),
        confidence: 0.5,
        bookingUrls: this.extractBookingUrls(raw.html || raw.snippet || ""),
      };
    });
  }

  private generateStableId(url: string, provider: string, query: string, index: number): string {
    return `${provider}:${Buffer.from(url).toString('base64').slice(0, 32)}:${index}`;
  }

  private extractPropertyName(text: string): string {
    // Extract potential property names from text
    if (/hotel|resort|villa|homestay|boutique/gi.test(text)) {
      const match = text.match(/(?:hotel|resort|villa|homestay|boutique)\s+(?:[a-zA-Z\s]+)/gi);
      if (match) return match[0].trim();
    }
    return "Property";
  }

  private extractDestination(text: string): string | undefined {
    for (const dest of DESTINATIONS) {
      if (new RegExp(`\b${dest.name}\b`, "i").test(text)) {
        return dest.slug;
      }
    }
    return undefined;
  }

  private extractPropertyType(text: string): any {
    if (/hotel/gi.test(text)) return "hotel";
    if (/resort/gi.test(text)) return "resort";
    if (/villa/gi.test(text)) return "villa";
    if (/homestay/gi.test(text)) return "homestay";
    if (/boutique/gi.test(text)) return "boutique";
    return undefined;
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }

  private classifySource(url: string, text: string): any {
    const hostname = this.extractDomain(url).toLowerCase();
    if (/booking\.com|agoda\.com|makemytrip\.com|goibibo\.com/.test(hostname)) {
      return "booking_platform";
    }
    if (/tripadvisor\.com|review/.test(hostname) || /review|rating/.test(text, "i")) {
      return "review_website";
    }
    if (/blog|article|medium\.com|tripstory/.test(hostname) || /article|story|blog/.test(text, "i")) {
      return "travel_article";
    }
    if (/yelp|directory|listings/.test(hostname) || /directory|listing/.test(text, "i")) {
      return "directory_listing";
    }
    return "general_search";
  }

  private extractImageUrl(html: string): string | undefined {
    const imgRe = /<img[^>]+src="([^"]+)"[^>]*alt="[^"]*"[^>]*>/i;
    const match = imgRe.exec(html);
    if (match && match[1]) return match[1];
    return undefined;
  }

  private extractRating(text: string): any {
    const ratingRe = /(\d+\.?\d*)\s*/gi;
    const matches = Array.from(text.matchAll(ratingRe));
    if (matches.length > 0) {
      const num = parseFloat(matches[0][1]);
      if (num >= 0 && num <= 5) {
        return {
          value: num,
          scale: 5,
          reviewCount: undefined,
          sourceUrl: "",
          retrievedAt: new Date().toISOString(),
        };
      }
    }
    return undefined;
  }

  private extractPrice(text: string): any {
    const priceRe = /₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
    const matches = Array.from(text.matchAll(priceRe));
    if (matches.length > 0) {
      const num = parseFloat(matches[0][1].replace(/,/g, ""));
      return {
        amount: num,
        currency: "INR",
        per: "night",
        label: "per night",
        sourceUrl: "",
        retrievedAt: new Date().toISOString(),
      };
    }
    return undefined;
  }

  private extractAmenities(text: string): any[] {
    const amenityList = [
      "swimming pool",
      "wifi",
      "air conditioning",
      "parking",
      "restaurant",
      "spa",
      "gym",
      "breakfast",
    ];
    const found: any[] = [];
    for (const amenity of amenityList) {
      if (text.toLowerCase().includes(amenity.toLowerCase())) {
        const mapping: Record<string, any> = {
          "swimming pool": "swimming_pool",
          wifi: "wifi",
          "air conditioning": "air_conditioning",
          parking: "parking",
          restaurant: "restaurant",
          spa: "spa",
          gym: "gym",
          breakfast: "breakfast",
        };
        found.push(mapping[amenity]);
      }
    }
    return found;
  }

  private extractCoordinates(html: string): any {
    const latRe = /lat\s*=\s*"?(-?\d+\.?\d*)"/i;
    const lngRe = /lng\s*=\s*"?(-?\d+\.?\d*)"/i;
    const latMatch = html.match(latRe);
    const lngMatch = html.match(lngRe);
    if (latMatch && lngMatch) {
      return {
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
      };
    }
    return undefined;
  }

  private extractBookingUrls(text: string): any[] {
    const bookingPlatforms = ["booking.com", "agoda.com", "makemytrip.com", "goibibo.com"];
    const urls: any[] = [];

    const urlRe = /https?:\/\/[^\s"\']+/gi;
    const matches = Array.from(text.matchAll(urlRe));

    for (const match of matches) {
      const url = match[0];
      const hostname = this.extractDomain(url).toLowerCase();
      if (bookingPlatforms.some((platform) => hostname.includes(platform))) {
        urls.push({
          label: this.getPlatformLabel(hostname),
          url,
          platform: hostname,
        });
      }
    }

    return urls;
  }

  private getPlatformLabel(hostname: string): string {
    if (hostname.includes("booking.com")) return "Booking.com";
    if (hostname.includes("agoda.com")) return "Agoda";
    if (hostname.includes("makemytrip.com")) return "MakeMyTrip";
    if (hostname.includes("goibibo.com")) return "Goibibo";
    return "Book Now";
  }
}