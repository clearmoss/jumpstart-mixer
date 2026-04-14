import type { CardDeck } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";
import backImage from "/back.jpg";

type CardImageProps = {
  card: CardDeck | null;
  className?: string;
};

export function CardImage({ card, className }: CardImageProps) {
  let imageUrl: string | null;
  if (card?.imageUri) {
    // this is a theme card with hardcoded image URL
    imageUrl = card.imageUri;
  } else {
    // we need to construct the URL for a regular card
    const scryfallId = card?.identifiers.scryfallId;
    imageUrl = scryfallId
      ? `https://cards.scryfall.io/normal/front/${scryfallId.charAt(
          0,
        )}/${scryfallId.charAt(1)}/${scryfallId}.jpg`
      : null;
  }

  if (!card || !imageUrl) {
    return (
      <div className={cn("aspect-63/88 overflow-hidden rounded-md", className)}>
        <img
          src={backImage}
          alt={"Card back"}
          className="h-full w-full rounded-xl"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-63/88 overflow-hidden rounded-md",
        className,
      )}
    >
      <img
        src={imageUrl}
        alt={`${card.name} card image`}
        className="h-full w-full rounded-xl dark:rounded-2xl"
      />
      {card.rarity === "mythic" && (
        <div className="holographic absolute top-0 left-0 z-10 h-full w-full rounded-xl dark:rounded-2xl" />
      )}
    </div>
  );
}
