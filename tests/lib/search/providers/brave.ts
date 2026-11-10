import { SearchProvider } from "./base";
import { SearchOptions, SearchResponse } from "../../types/search";

/**
 * Brave Search HTML adapter.
 *
 * Brave Search's HTML endpoint is generally accessible without an API key,
 * but automated retrieval is subject to Brave's terms and rate limits.
 * This adapter respects those limits with conservative retry/interval
 * settings and never fabricates results.
 */
export class BraveProvider extends SearchProvider {
  getProviderName(): string {
    return "brave";
  }

  getConfig() {
    return {
      name: "brave",
      enabled: process.env.STAYFINDER_ENABLE_BRAVE !== "0",
      automatedRetrievalPermitted: true,
      respectsRobots: true,
      minIntervalMs: 1500,
      maxRetries: 1,
      timeoutMs: 8000,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      notes: "Respects Brave rate limits. Conservative retries only.",
    };
  }

  isAvailable(): boolean {
    return this.getConfig().enabled;
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    const searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(options.query)}`;
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
          message: `Brave returned HTTP ${res.status}. Automated retrieval blocked.`,
        };
      }
      if (!res.ok) {
        return {
          provider: this.getProviderName(),
          query: options.query,
          status: "unavailable",
          results: [],
          searchUrl,
          message: `Brave returned HTTP ${res.status}.`,
        };
      }

      const html = await res.text();
      const results = this.parseHtml(html);
      return {
        provider: this.getProviderName(),
        query: options.query,
        status: results.length > 0 ? "available" : "empty",
        results,
        searchUrl,
      };
    } catch (err: any) {
      if (err?.message?.includes("timed out")) {
        return {
          provider: this.getProviderName(),
          query: options.query,
          status: "timeout",
          results: [],
          searchUrl,
          message: "Brave request timed out.",
        };
      }
      return {
        provider: this.getProviderName(),
        query: options.query,
        status: "unavailable",
        results: [],
        searchUrl,
        message: "Brave request failed.",
      };
    }
  }

  private parseHtml(html: string): any[] {
    const results: any[] = [];
    const snippetRe =
      /<div[^>]+class="snippet"[^>]*>([\s\S]*?)<\/div>/gi;
    const linkRe = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

    const links: { url: string; title: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html)) !== null) {
      const url = m[1];
      if (/search\.brave\.com/.test(url)) continue;
      const title = stripTags(m[2]);
      if (title) links.push({ url, title });
    }

    for (let i = 0; i < links.length && i < 20; i++) {
      results.push({
        title: links[i].title,
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

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}