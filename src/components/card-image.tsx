import type { CardDeck } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";
import backImage from "/back.jpg";

type CardImageProps = {
  card: CardDeck | null;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export function CardImage({
  card,
  className,
  onMouseEnter,
  onMouseLeave,
}: CardImageProps) {
  let imageUrl: string | null;
  let scryfallUrl: string | null;

  if (card?.imageUri) {
    // this is a theme card with hardcoded image URL
    imageUrl = card.imageUri;
    scryfallUrl = `https://scryfall.com/search?q=${card.name}+set%3A${card.setCode}`;
  } else {
    // we need to construct the URL for a regular card
    const scryfallId = card?.identifiers.scryfallId;
    imageUrl = scryfallId
      ? `https://cards.scryfall.io/normal/front/${scryfallId.charAt(
          0,
        )}/${scryfallId.charAt(1)}/${scryfallId}.jpg`
      : null;
    scryfallUrl = `https://scryfall.com/card/${scryfallId}`;
  }

  if (!card || !imageUrl) {
    return (
      <div
        className={cn("aspect-63/88 overflow-hidden rounded-md", className)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <img
          src={backImage}
          alt={"Card back"}
          className="h-full w-full rounded-xl"
        />
      </div>
    );
  }

  return (
    <a
      href={scryfallUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "relative aspect-63/88 overflow-hidden rounded-md",
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img
        src={imageUrl}
        alt={`${card.name} card image`}
        className="h-full w-full rounded-xl dark:rounded-2xl"
      />
      {card.rarity === "mythic" && (
        <div className="holographic absolute top-0 left-0 z-10 h-full w-full rounded-xl dark:rounded-2xl" />
      )}
    </a>
  );
}
