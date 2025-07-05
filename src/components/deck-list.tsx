import { cn } from "@/lib/utils.ts";
import CardListEntry from "@/components/card-list-entry.tsx";
import { useAtom, useAtomValue } from "jotai/index";
import { currentSidebarCardAtom, showCategoriesAtom } from "@/lib/atoms.ts";
import type { CardDeck, Deck } from "@/lib/types.ts";
import { useMemo } from "react";
import { useImagePreloader } from "@/hooks/use-image-preloader.ts";

const TYPE_ORDER = [
  "Legendary Planeswalker",
  "Planeswalker",
  "Legendary Creature",
  "Creature",
  "Artifact Creature",
  "Enchantment Creature",
  "Instant",
  "Sorcery",
  "Artifact",
  "Legendary Enchantment",
  "Enchantment",
  "Land",
];

function getMainType(type: string): string {
  // remove the subtype after —, then return only the main type without specifier
  const mainType = type.split("—")[0].trim().split(" ").pop();

  return mainType ?? "Unknown";
}

function groupCardsByType(cards: CardDeck[]): Map<string, CardDeck[]> {
  return cards.reduce((groups, card) => {
    const mainType = getMainType(card.type);

    if (!groups.has(mainType)) {
      groups.set(mainType, []);
    }
    groups.get(mainType)!.push(card);

    return groups;
  }, new Map<string, CardDeck[]>());
}

function useDeckCardGrouping(pack: Deck | undefined) {
  const groupedCards = useMemo(() => {
    if (!pack?.mainBoard) return new Map<string, CardDeck[]>();

    return groupCardsByType(pack.mainBoard);
  }, [pack]);

  return useMemo(() => {
    const sortedTypes = Array.from(groupedCards.keys()).sort((a, b) => {
      const aIndex = TYPE_ORDER.indexOf(a);
      const bIndex = TYPE_ORDER.indexOf(b);
      // if both types are in the order array, use that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // if only one type is in the order array, put it first
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // if neither type is in the order array, sort alphabetically
      return a.localeCompare(b);
    });

    return sortedTypes.map((type) => {
      const cards = groupedCards.get(type) ?? [];
      const count = cards.reduce((sum, card) => sum + card.count, 0);

      return { type, cards, count };
    });
  }, [groupedCards]);
}

function DeckList({ pack }: { pack: Deck | undefined }) {
  const [showCategories] = useAtom(showCategoriesAtom);
  const currentSidebarCard = useAtomValue(currentSidebarCardAtom);
  const cardGroups = useDeckCardGrouping(pack);

  const imageUrls = useMemo(() => {
    return (
      pack?.mainBoard
        .map((card) => {
          const scryfallId = card.identifiers.scryfallId;
          if (scryfallId) {
            return `https://cards.scryfall.io/normal/front/${scryfallId.charAt(
              0,
            )}/${scryfallId.charAt(1)}/${scryfallId}.jpg`;
          }
          return null;
        })
        .filter((url): url is string => !!url) ?? []
    );
  }, [pack]);

  useImagePreloader(imageUrls);

  if (!pack) {
    return <div>Pack data unavailable.</div>;
  }

  return (
    <div className={cn("flex flex-col", showCategories && "gap-2")}>
      {cardGroups.map(({ type, count, cards }) => (
        <div key={type}>
          <h3
            className={cn(
              "text-muted-foreground text-sm font-semibold",
              !showCategories && "hidden",
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
