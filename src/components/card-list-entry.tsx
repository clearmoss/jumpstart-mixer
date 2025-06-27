import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card.tsx";
import type { CardDeck } from "@/lib/types.ts";
import { useState } from "react";

function CardListEntry({ card }: { card: CardDeck }) {
  const [shouldLoadImage, setShouldLoadImage] = useState(false);

  // Format Scryfall ID for image URL
  const scryfallId = card.identifiers.scryfallId;
  const imageUrl = scryfallId
    ? `https://cards.scryfall.io/normal/front/${scryfallId.charAt(0)}/${scryfallId.charAt(1)}/${scryfallId}.jpg`
    : null;

  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      onOpenChange={(open) => {
        // When the hover card opens, set shouldLoadImage to true
        if (open) {
          setShouldLoadImage(true);
        }
      }}
    >
      <HoverCardTrigger>
        <li key={card.identifiers.scryfallId}>
          <a
            className="cursor-pointer"
            href={`https://scryfall.com/card/${card.identifiers.scryfallId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {card.count} {card.name}
          </a>
        </li>
      </HoverCardTrigger>
      <HoverCardContent side={"right"} className="w-auto max-w-xl">
        <div className="h-[502px] w-[360px] overflow-hidden rounded-md">
          {shouldLoadImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={`${card.name} card image`}
              className="h-full w-full rounded-xl object-contain"
              loading="lazy"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              Loading...
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default CardListEntry;
