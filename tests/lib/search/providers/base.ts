import { z } from "zod";
import {
  SearchProviderStatus,
  SearchResponse,
  SearchOptions,
  ProviderConfig,
  RawSearchResult,
} from "../../types/search";

export abstract class SearchProvider {
  abstract getProviderName(): string;
  abstract getConfig(): ProviderConfig;
  abstract isAvailable(): boolean;

  /**
   * Execute a search. Implementations MUST NOT bypass CAPTCHA, login walls,
   * robots directives, or rate limits. On any access restriction the
   * implementation returns status "blocked" or "not_permitted" and never
   * fabricates results.
   */
  abstract search(options: SearchOptions): Promise<SearchResponse>;

  protected emptyResponse(
    status: SearchProviderStatus,
    message: string,
    searchUrl?: string
  ): SearchResponse {
    return {
      provider: this.getProviderName(),
      query: "",
      status,
      results: [],
      searchUrl,
      message,
    };
  }

  protected async functionWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await promise;
    } catch (err: any) {
      if (err?.name === "AbortError" || controller.signal.aborted) {
        throw new Error(timeoutMessage);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  protected async fetchWithRetry(
    url: string,
    init: RequestInit,
    config: ProviderConfig,
    signal?: AbortSignal
  ): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          ...init,
          signal: signal ?? undefined,
          redirect: "follow",
        });
        if (res.status === 429 || res.status >= 500) {
          lastError = new Error(
            `${this.getProviderName()} returned status ${res.status}`
          );
          if (attempt < config.maxRetries) {
            await sleep(config.minIntervalMs * (attempt + 1));
            continue;
          }
        }
        return res;
      } catch (err: any) {
        lastError = err;
        if (attempt < config.maxRetries) {
          await sleep(config.minIntervalMs * (attempt + 1));
          continue;
        }
      }
    }
    throw lastError ?? new Error("fetch failed");
  }

  protected normalize(raw: RawSearchResult[]): RawSearchResult[] {
    return raw;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const SearchProviderConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  automatedRetrievalPermitted: z.boolean(),
  respectsRobots: z.boolean(),
  minIntervalMs: z.number().int().nonnegative(),
  maxRetries: z.number().int().nonnegative(),
  timeoutMs: z.number().int(),
  userAgent: z.string(),
});

export type SearchProviderConfig = z.infer<typeof SearchProviderConfigSchema>;