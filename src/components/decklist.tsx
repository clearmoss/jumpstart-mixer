import type { Deck } from "@/lib/AllMTGJSONTypes.ts";

function Decklist({ deck }: { deck: Deck | null }) {
  // @ts-expect-error testing
  return <div>{deck.name}</div>;
}

export default Decklist;
