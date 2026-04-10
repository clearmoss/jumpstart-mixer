import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import {
  currentSidebarCardAtom,
  currentSidebarDeckListAtom,
  store,
} from "@/lib/atoms.ts";
import { themeCardQueryOptions } from "@/lib/queries.ts";
import {
  themeCardFetchQueue,
  themeCardFetchTracker,
} from "@/hooks/use-theme-card-preloader.ts";
import type { CardDeck, Deck } from "@/lib/types.ts";
import { cleanThemeName } from "@/lib/utils.ts";

export function usePackHover(
  pack: Deck | undefined,
  publicId: string | undefined,
) {
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(async () => {
    if (pack && publicId) {
      // update the decklist/sidebar details immediately
      setCurrentSidebarDeckList({ pack, publicId });

      // remove trailing numbers for improved query caching
      const themeName = cleanThemeName(pack.name);
      const options = themeCardQueryOptions(themeName, pack.code);
      const cacheKey = `${themeName}-${pack.code}`;

      // check cache first
      const cached = queryClient.getQueryData<CardDeck>(options.queryKey);
      if (cached) {
        setCurrentSidebarCard(cached);
        return;
      }

      // debounce the fetch call to avoid triggering on quick hovers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const task = async () => {
          try {
            const themeCard = await queryClient.fetchQuery(options);

            // only update the sidebar card if this pack is still the one the user is hovering over
            const currentSidebar = store.get(currentSidebarDeckListAtom);
            if (themeCard && currentSidebar.publicId === publicId) {
              setCurrentSidebarCard(themeCard);
            }
            return themeCard;
          } catch (error) {
            console.error(
              `Failed to fetch theme card for ${themeName}:`,
              error,
            );
            return null;
          } finally {
            // only remove from tracker if it's still our high-priority entry
            const current = themeCardFetchTracker.get(cacheKey);
            if (current && current.priority === 10) {
              themeCardFetchTracker.delete(cacheKey);
            }
          }
        };

        // if it's already being fetched at high priority, just wait for it
        const existing = themeCardFetchTracker.get(cacheKey);
        if (existing && existing.priority >= 10) {
          void existing.promise.then(async () => {
            // after prefetch finishes, check if it's still the active hover and update the card
            const cached = queryClient.getQueryData<CardDeck>(options.queryKey);
            const currentSidebar = store.get(currentSidebarDeckListAtom);
            if (cached && currentSidebar.publicId === publicId) {
              setCurrentSidebarCard(cached);
            }
          });
          return;
        }

        // if not in tracker or it's a low-priority prefetch, add to the throttled queue with high priority
        const queuedTask = themeCardFetchQueue.add(task, { priority: 10 });
        themeCardFetchTracker.set(cacheKey, {
          promise: queuedTask,
          priority: 10,
        });
      }, 150);
    }
  }, [
    pack,
    publicId,
    setCurrentSidebarDeckList,
    queryClient,
    setCurrentSidebarCard,
  ]);

  return { handleMouseEnter };
}
