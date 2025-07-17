import type { CardDeck, Deck } from "@/lib/types.ts";
import { useMemo } from "react";

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

export function useCardGrouping(pack: Deck | undefined) {
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
