import type { Deck } from "@/lib/types.ts";
import {
  Card,
  // CardAction,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "@tanstack/react-router";

function Deck({
  packs,
  publicIds,
}: {
  packs: Deck[] | null;
  publicIds: string[] | null;
}) {
  if (packs === null || publicIds === null) {
    return <div>Deck data unavailable.</div>;
  }

  return (
    <Card className="bg-card">
      <Link
        to="/packs/$packId"
        params={{
          packId: publicIds[1],
        }}
      >
        <CardHeader>
          {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
          <CardTitle>{packs[1].name.replace(/\((\d+)\)/g, "$1")}</CardTitle>
          <CardDescription>{packs[1].code}</CardDescription>
          {/*<CardAction>Card Action</CardAction>*/}
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col gap-2">
        <ul>
          {packs[1].mainBoard.map((card) => (
            <li>
              <a
                className="cursor-pointer"
                href={`https://scryfall.com/card/${card.identifiers.scryfallId}`}
                target="_blank"
                rel="noopener noreferrer"
                key={card.identifiers.scryfallId}
              >
                {card.name} x{card.count}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
      {/*<CardFooter>*/}
      {/*  <p>Card Footer</p>*/}
      {/*</CardFooter>*/}
    </Card>
    // <div className="flex flex-col gap-2 rounded-lg bg-orange-200 px-8 py-4">
    //   <span>{pack.code}</span>
    //   <span>{pack.name}</span>
    // </div>
  );
}

export default Deck;
