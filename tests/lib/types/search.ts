import { z } from "zod";

export const SearchProviderStatus = z.enum([
  "available",
  "unavailable",
  "blocked",
  "rate_limited",
  "timeout",
  "not_permitted",
]);

export type SearchProviderStatus = z.infer<SearchProviderStatus>;

export const RawSearchResult = z.object({
  title: z.string().optional(),
  snippet: z.string().optional(),
  url: z.string().url(),
  displayUrl: z.string().optional(),
  html: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RawSearchResult = z.infer<RawSearchResult>;

export const SearchResponse = z.object({
  provider: z.string(),
  query: z.string(),
  status: SearchProviderStatus,
  results: z.array(RawSearchResult),
  searchUrl: z.string().url().optional(),
  message: z.string().optional(),
  elapsedMs: z.number().optional(),
});

export type SearchResponse = z.infer<SearchResponse>;

export const SearchOptions = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(50).default(20),
  timeoutMs: z.number().int().min(1000).max(20000).default(8000),
  signal: z.any().optional(),
});

export type SearchOptions = z.infer<SearchOptions>;

export const ProviderConfig = z.object({
  name: z.string(),
  enabled: z.boolean(),
  automatedRetrievalPermitted: z.boolean(),
  respectsRobots: z.boolean(),
  minIntervalMs: z.number().int().nonnegative().default(1000),
  maxRetries: z.number().int().nonnegative().default(1),
  timeoutMs: z.number().int().min(1000).max(20000).default(8000),
  userAgent: z.string(),
  notes: z.string().optional(),
});

export type ProviderConfig = z.infer<ProviderConfig>;