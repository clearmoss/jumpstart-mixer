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

function Pack({
  pack,
  publicId,
}: {
  pack: Deck | undefined;
  publicId: string | undefined;
}) {
  if (pack === undefined || publicId === undefined) {
    return <div>Pack data unavailable.</div>;
  }

  return (
    <Card className="bg-card">
      <Link
        to="/packs/$packId"
        params={{
          packId: publicId,
        }}
      >
        <CardHeader>
          {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
          <CardTitle>{pack.name.replace(/\((\d+)\)/g, "$1")}</CardTitle>
          <CardDescription>{pack.code}</CardDescription>
          {/*<CardAction>Card Action</CardAction>*/}
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col gap-2">
        <ul>
          {pack.mainBoard.map((card) => (
            <li key={card.identifiers.scryfallId}>
              <a
                className="cursor-pointer"
                href={`https://scryfall.com/card/${card.identifiers.scryfallId}`}
                target="_blank"
                rel="noopener noreferrer"
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

export default Pack;
