import { useAtomValue } from "jotai";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";
import MediaQuery from "react-responsive";

export function CardImage() {
  const card = useAtomValue(currentSidebarCardAtom);

  const scryfallId = card?.identifiers.scryfallId;
  const imageUrl = scryfallId
    ? `https://cards.scryfall.io/normal/front/${scryfallId.charAt(
        0,
      )}/${scryfallId.charAt(1)}/${scryfallId}.jpg`
    : null;

  if (!card || !imageUrl) {
    return (
      <MediaQuery minWidth={1024}>
        <div className="aspect-63/88 w-[360px] overflow-hidden rounded-md">
          <img src={"back.jpg"} alt={""} className="h-full w-full rounded-xl" />
        </div>
      </MediaQuery>
    );
  }

  return (
    <MediaQuery minWidth={1024}>
      <div className="relative aspect-63/88 w-[360px] overflow-hidden rounded-md">
        <img
          src={imageUrl}
          alt={`${card.name} card image`}
          className="h-full w-full rounded-xl dark:rounded-2xl"
        />
        {card.rarity === "mythic" && (
          <div className="holographic absolute top-0 left-0 z-10 h-full w-full rounded-xl dark:rounded-2xl" />
        )}
      </div>
    </MediaQuery>
  );
}
