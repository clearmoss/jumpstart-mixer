import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PQueue from "p-queue";
import { themeCardQueryOptions } from "@/lib/queries.ts";
import type { Deck } from "@/lib/types.ts";

// respect Scryfall's rate limit of 500 ms between requests
const queue = new PQueue({ intervalCap: 1, interval: 550 });
const prefetchedThemeCards = new Set<string>();

export function useThemeCardPreloader(pack: Deck | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!pack) return;

    // remove trailing numbers for improved query caching
    const themeName = pack.name.replace(/\s+\d+$|\s*\(\d+\)$/, "").trim();
    const cacheKey = `${themeName}-${pack.code}`;

    if (prefetchedThemeCards.has(cacheKey)) {
      return;
    }

    // prevent duplicate queuing
    prefetchedThemeCards.add(cacheKey);

    void queue.add(async () => {
      try {
        await queryClient.prefetchQuery(
          themeCardQueryOptions(themeName, pack.code),
        );
      } catch (error) {
        console.error(`Failed to prefetch theme card for ${themeName}:`, error);
      }
    });
  }, [pack, queryClient]);
}
