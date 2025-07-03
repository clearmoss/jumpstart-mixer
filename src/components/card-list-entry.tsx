import type { CardDeck } from "@/lib/types.ts";
import React, { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { currentSidebarCardAtom, sidebarCardSlotRefAtom } from "@/lib/atoms.ts";
import { createPortal } from "react-dom";
import MediaQuery from "react-responsive";
import { cn } from "@/lib/utils.ts";

const RARITY_TEXT_COLORS: Record<string, string> = {
  common: "text-current",
  uncommon: "text-sky-600",
  rare: "text-yellow-600",
  mythic: "text-orange-600",
};

type SidebarCardPreviewProps = {
  card: CardDeck;
  isCurrentlyDisplayed: boolean;
};

type CardListEntryProps = {
  card: CardDeck;
  isCurrentlyDisplayed?: boolean;
};

function SidebarCardPreview({
  card,
  isCurrentlyDisplayed,
}: SidebarCardPreviewProps) {
  const sidebarRef = useAtomValue(sidebarCardSlotRefAtom);
  const scryfallId = card.identifiers.scryfallId;
  const imageUrl = scryfallId
    ? `https://cards.scryfall.io/normal/front/${scryfallId.charAt(0)}/${scryfallId.charAt(1)}/${scryfallId}.jpg`
    : null;

  if (!isCurrentlyDisplayed || !sidebarRef || !imageUrl) {
    return null;
  }

  return (
    <MediaQuery minWidth={1024}>
      {createPortal(
        <div className="h-[502px] w-[360px] overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt={`${card.name} card image`}
            className="h-full w-full rounded-xl object-contain"
            loading="lazy"
          />
          {card.rarity === "mythic" && (
            <div className="holographic absolute top-4 left-4 z-10 h-94/100 w-92/100" />
          )}
        </div>,
        sidebarRef,
      )}
    </MediaQuery>
  );
}

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
    <>
      <li
        className={cn("px-2", isCurrentlyDisplayed && "lg:bg-gray-200")}
        onMouseEnter={handleMouseEnter}
      >
        <a
          className="cursor-pointer"
          href={scryfallUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={cardRarityColor}>
            {card.count} {card.name}
          </span>
        </a>
      </li>
      <SidebarCardPreview
        card={card}
        isCurrentlyDisplayed={isCurrentlyDisplayed}
      />
    </>
  );
}

export default React.memo(CardListEntry);
