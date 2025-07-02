import { cn } from "@/lib/utils.ts";
import CardListEntry from "@/components/card-list-entry.tsx";
import { useAtom } from "jotai/index";
import { showCategoriesAtom } from "@/lib/atoms.ts";
import type { CardDeck, Deck } from "@/lib/types.ts";

function getMainType(type: string): string {
  // remove the subtype after —, then return only the main type without specifier
  const mainType = type.split("—")[0].trim().split(" ").pop();
  return mainType ? mainType : "Unknown";
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

function DeckList({ pack }: { pack: Deck | undefined }) {
  const [showCategories] = useAtom(showCategoriesAtom);

  if (!pack) {
    return <div>Pack data unavailable.</div>;
  }

  const groupedCards = groupCardsByType(pack.mainBoard);
  const typeOrder = [
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
  const sortedTypes = Array.from(groupedCards.keys()).sort((a, b) => {
    const aIndex = typeOrder.indexOf(a);
    const bIndex = typeOrder.indexOf(b);
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

  return (
    <div className={cn("flex flex-col", showCategories && "gap-4")}>
      {sortedTypes.map((type) => (
        <div key={type}>
          <h3
            className={cn(
              "text-muted-foreground text-sm font-semibold",
              !showCategories && "hidden",
            )}
          >
            {type} (
            {groupedCards
              .get(type)
              ?.reduce((sum, card) => sum + card.count, 0) ?? 0}
            )
          </h3>
          <ul className={cn(showCategories && "ml-2")}>
            {groupedCards.get(type)?.map((card) => (
              <CardListEntry card={card} key={card.identifiers.scryfallId} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DeckList;
