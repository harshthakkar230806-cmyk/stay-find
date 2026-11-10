import { SearchProvider } from "./base";
import { DuckDuckGoProvider } from "./duckduckgo";
import { BraveProvider } from "./brave";

/**
 * Provider registry. Providers are independent: one unavailable provider
 * never breaks the application. Each provider returns a structured status
 * and a user-facing search URL when automated retrieval is unavailable.
 */
export function getProviders(): SearchProvider[] {
  return [new BraveProvider(), new DuckDuckGoProvider()];
}

export function getProviderByName(name: string): SearchProvider | undefined {
  return getProviders().find((p) => p.getProviderName() === name);
}

export function buildProviderStatusList() {
  return getProviders().map((p) => {
    const cfg = p.getConfig();
    return {
      name: p.getProviderName(),
      enabled: cfg.enabled,
      automatedRetrievalPermitted: cfg.automatedRetrievalPermitted,
      available: p.isAvailable(),
    };
  });
}