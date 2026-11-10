import { SearchProvider } from "./base";
import { SearchOptions, SearchResponse, RawSearchResult } from "../../types/search";

/**
 * DuckDuckGo HTML provider.
 *
 * Automated retrieval of the DuckDuckGo HTML endpoint is NOT reliably
 * permitted by the provider's terms. This adapter therefore defaults to
 * "not_permitted" and exposes a direct search URL for the user.
 *
 * If the operator explicitly enables automated retrieval via the
 * STAYFINDER_ALLOW_DDG_HTML=1 env flag (opt-in, operator-controlled),
 * the adapter attempts retrieval and gracefully falls back on any
 * access restriction. It NEVER fabricates results.
 */
export class DuckDuckGoProvider extends SearchProvider {
  private readonly automatedPermitted: boolean;

  constructor() {
    super();
    this.automatedPermitted =
      process.env.STAYFINDER_ALLOW_DDG_HTML === "1";
  }

  getProviderName(): string {
    return "duckduckgo";
  }

  getConfig() {
    return {
      name: "duckduckgo",
      enabled: true,
      automatedRetrievalPermitted: this.automatedPermitted,
      respectsRobots: true,
      minIntervalMs: 2000,
      maxRetries: 1,
      timeoutMs: 8000,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      notes:
        "Automated HTML retrieval is opt-in only. Default behaviour is to expose a user-facing search URL.",
    };
  }

  isAvailable(): boolean {
    return this.automatedPermitted;
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(options.query)}&ia=web`;

    if (!this.automatedPermitted) {
      return {
        provider: this.getProviderName(),
        query: options.query,
        status: "not_permitted",
        results: [],
        searchUrl,
        message:
          "Automated retrieval from DuckDuckGo is not enabled. Open the search URL to view results manually.",
      };
    }

    try {
      const res = await this.fetchWithRetry(
        searchUrl,
        {
          headers: {
            "User-Agent": this.getConfig().userAgent,
            Accept: "text/html,application/xhtml+xml",
          },
        },
        this.getConfig(),
        options.signal
      );

      if (res.status === 403 || res.status === 429) {
        return {
          provider: this.getProviderName(),
          query: options.query,
          status: "blocked",
          results: [],
          searchUrl,
          message: `DuckDuckGo returned HTTP ${res.status}. Automated retrieval blocked.`,
        };
      }

      if (!res.ok) {
        return {
          provider: this.getProviderName(),
          query: options.query,
          status: "unavailable",
          results: [],
          searchUrl,
          message: `DuckDuckGo returned HTTP ${res.status}.`,
        };
      }

      const html = await res.text();
      const results = this.parseHtml(html, options.query);
      return {
        provider: this.getProviderName(),
        query: options.query,
        status: results.length > 0 ? "available" : "empty",
        results,
        searchUrl,
        elapsedMs: undefined,
      };
    } catch (err: any) {
      if (err?.message?.includes("timed out")) {
        return {
          provider: this.getProviderName(),
          query: options.query,
          status: "timeout",
          results: [],
          searchUrl,
          message: "DuckDuckGo request timed out.",
        };
      }
      return {
        provider: this.getProviderName(),
        query: options.query,
        status: "unavailable",
        results: [],
        searchUrl,
        message: "DuckDuckGo request failed.",
      };
    }
  }

  private parseHtml(html: string, query: string): RawSearchResult[] {
    const results: RawSearchResult[] = [];
    const linkRe =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRe =
      /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    const links: { url: string; title: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) !== null) {
      const rawUrl = decodeEntity(m[1]);
      const title = stripTags(decodeEntity(m[2]));
      if (rawUrl && title) links.push({ url: rawUrl, title });
    }

    const snippets: string[] = [];
    while ((m = snippetRe.exec(html)) !== null) {
      snippets.push(stripTags(decodeEntity(m[1])));
    }

    for (let i = 0; i < links.length && i < 20; i++) {
      results.push({
        title: links[i].title,
        snippet: snippets[i],
        url: links[i].url,
        displayUrl: extractDomain(links[i].url),
      });
    }
    return results;
  }
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntity(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}