import type { CardDeck } from "@/lib/types.ts";
import React, { useCallback } from "react";
import { useSetAtom } from "jotai";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";
import { cn } from "@/lib/utils.ts";
import OutLink from "@/components/out-link.tsx";

const RARITY_TEXT_COLORS: Record<string, string> = {
  common: "text-primary",
  uncommon: "text-sky-600",
  rare: "text-yellow-600",
  mythic: "text-orange-600",
};

type CardListEntryProps = {
  card: CardDeck;
  isCurrentlyDisplayed?: boolean;
};

function CardListEntry({
  card,
  isCurrentlyDisplayed = false,
}: CardListEntryProps) {
  const setCurrentCard = useSetAtom(currentSidebarCardAtom);
  const cardRarityColor = RARITY_TEXT_COLORS[card.rarity] ?? "text-current";
  const handleMouseEnter = useCallback(() => {
    setCurrentCard(card);
  }, [card, setCurrentCard]);
  const scryfallId = card.identifiers.scryfallId;
  const scryfallUrl = scryfallId
    ? `https://scryfall.com/card/${scryfallId}`
    : "#";

  return (
    <li
      className={cn("px-2", isCurrentlyDisplayed && "lg:bg-accent")}
      onMouseEnter={handleMouseEnter}
    >
      <OutLink href={scryfallUrl}>
        <span className={cardRarityColor}>
          {card.count} {card.name}
        </span>
      </OutLink>
    </li>
  );
}

export default React.memo(CardListEntry);
