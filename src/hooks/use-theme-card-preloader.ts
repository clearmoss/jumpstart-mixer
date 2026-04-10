import { useEffect } from "react";
import { useQueryClient, useIsRestoring } from "@tanstack/react-query";
import PQueue from "p-queue";
import { themeCardQueryOptions } from "@/lib/queries.ts";
import { cleanThemeName } from "@/lib/utils.ts";
import type { CardDeck, Deck } from "@/lib/types.ts";

// respect Scryfall's rate limit of 500 ms between requests
export const themeCardFetchQueue = new PQueue({
  intervalCap: 1,
  interval: 550,
});

export const themeCardFetchTracker = new Map<
  string,
  { promise: Promise<CardDeck | null>; priority: number }
>();

export function useThemeCardPreloader(pack: Deck | undefined) {
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();

  useEffect(() => {
    if (!pack || isRestoring) return;

    // remove trailing numbers for improved query caching
    const themeName = cleanThemeName(pack.name);
    const cacheKey = `${themeName}-${pack.code}`;

    // if already in tracker (queued, in-progress, or completed), don't queue again
    if (themeCardFetchTracker.has(cacheKey)) {
      return;
    }

    // check if it's already in TanStack Query cache
    const options = themeCardQueryOptions(themeName, pack.code);
    if (queryClient.getQueryData(options.queryKey)) {
      return;
    }

    const task = async () => {
      try {
        return await queryClient.fetchQuery(options);
      } catch (error) {
        console.error(`Failed to prefetch theme card for ${themeName}:`, error);
        // remove from tracker on error so it can be retried if needed
        themeCardFetchTracker.delete(cacheKey);
        return null;
      }
    };

    const queuedTask = themeCardFetchQueue.add(task, { priority: 0 });
    themeCardFetchTracker.set(cacheKey, { promise: queuedTask, priority: 0 });

    void queuedTask.finally(() => {
      // we only remove it from the tracker if the priority is still 0 (low)
      // because high-priority hover fetches might have taken it over
      const current = themeCardFetchTracker.get(cacheKey);
      if (current && current.priority === 0) {
        themeCardFetchTracker.delete(cacheKey);
      }
    });
  }, [pack, queryClient, isRestoring]);
}
