import type { CardDeck, Deck } from "@/lib/types.ts";
import { useMemo } from "react";
import { type MtgRarity, type MtgType, RARITIES, TYPES } from "@/lib/utils.ts";

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

export function useCardGrouping(pack: Deck | undefined) {
  const groupedCards = useMemo(() => {
    if (!pack?.mainBoard) return new Map<string, CardDeck[]>();

    return groupCardsByType(pack.mainBoard);
  }, [pack]);

  return useMemo(() => {
    const sortedTypes = Array.from(groupedCards.keys()).sort((a, b) => {
      const typeA = TYPES.find((t) => t.code === (a as MtgType));
      const typeB = TYPES.find((t) => t.code === (b as MtgType));

      // if both types are in the TYPES array, use their order
      if (typeA && typeB) {
        return typeA.order - typeB.order;
      }

      // if only one type is in the TYPES array, put it first
      if (typeA) return -1;
      if (typeB) return 1;

      // if neither type is in the TYPES array, sort alphabetically
      return a.localeCompare(b);
    });

    return sortedTypes.map((type) => {
      const cards = groupedCards.get(type) ?? [];
      const count = cards.reduce((sum, card) => sum + card.count, 0);
      const sortedCards = [...cards].sort((a, b) => {
        const rarityA = RARITIES.find(
          (r) => r.code === (a.rarity as MtgRarity),
        );
        const rarityB = RARITIES.find(
          (r) => r.code === (b.rarity as MtgRarity),
        );

        if (rarityA && rarityB && rarityA.order !== rarityB.order) {
          return rarityA.order - rarityB.order;
        }

        return a.name.localeCompare(b.name);
      });

      return { type, cards: sortedCards, count };
    });
  }, [groupedCards]);
}
