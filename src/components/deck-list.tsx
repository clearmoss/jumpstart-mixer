import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";

import type { Deck } from "@/lib/types.ts";

import CardListEntry from "@/components/card-list-entry.tsx";
import DeckListSkeleton from "@/components/skeletons/deck-list-skeleton.tsx";
import { useCardGrouping } from "@/hooks/use-card-grouping.ts";
import { useImagePreloader } from "@/hooks/use-image-preloader.ts";
import { currentSidebarCardAtom, showCategoriesAtom } from "@/lib/atoms.ts";
import { cn } from "@/lib/utils.ts";

function DeckList({ pack }: { pack: Deck | undefined }) {
  const [showCategories] = useAtom(showCategoriesAtom);
  const currentSidebarCard = useAtomValue(currentSidebarCardAtom);
  const cardGroups = useCardGrouping(pack);

  const imageUrls = useMemo(() => {
    return (
      pack?.mainBoard
        .map((card) => {
          const scryfallId = card.identifiers.scryfallId;
          if (scryfallId) {
            return `https://cards.scryfall.io/normal/front/${scryfallId.charAt(
              0
            )}/${scryfallId.charAt(1)}/${scryfallId}.jpg`;
          }
          return null;
        })
        .filter((url): url is string => !!url) ?? []
    );
  }, [pack]);

  useImagePreloader(imageUrls);

  if (!pack) {
    return <DeckListSkeleton />;
  }

  return (
    <div className={cn("flex flex-col", showCategories && "gap-2")}>
      {cardGroups.map(({ type, count, cards }) => (
        <div key={type}>
          <h3
            className={cn(
              "text-sm font-semibold text-muted-foreground",
              !showCategories && "hidden"
            )}
          >
            {type} ({count})
          </h3>
          <ul className={cn(showCategories && "ml-2")}>
            {cards.map((card) => (
              <CardListEntry
                key={card.identifiers.scryfallId}
                card={card}
                isCurrentlyDisplayed={currentSidebarCard?.uuid === card.uuid}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DeckList;
