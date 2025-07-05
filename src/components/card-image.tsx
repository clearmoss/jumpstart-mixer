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
        <div className="h-[502px] w-[360px] overflow-hidden rounded-md">
          <img
            src={"back.jpg"}
            alt={""}
            className="h-full w-full rounded-xl object-contain"
          />
        </div>
      </MediaQuery>
    );
  }

  return (
    <MediaQuery minWidth={1024}>
      <div className="h-[502px] w-[360px] overflow-hidden rounded-md">
        <img
          src={imageUrl}
          alt={`${card.name} card image`}
          className="h-full w-full rounded-xl object-contain"
        />
        {card.rarity === "mythic" && (
          <div className="holographic absolute top-4 left-4 z-10 h-94/100 w-92/100" />
        )}
      </div>
    </MediaQuery>
  );
}
