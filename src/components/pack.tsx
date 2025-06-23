import type { ClipboardCard, Deck } from "@/lib/types.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { Clipboard } from "lucide-react";
import { makeDeckListString, populateDeckList } from "@/lib/utils.ts";
import { useEffect, useState } from "react";

function Pack({
  pack,
  publicId,
}: {
  pack: Deck | undefined;
  publicId: string | undefined;
}) {
  const [currentDeckList, setCurrentDeckList] = useState("");

  useEffect(() => {
    if (pack) {
      const deckList: ClipboardCard[] = [];
      populateDeckList(pack, deckList);
      setCurrentDeckList(makeDeckListString(deckList));
    }
  }, [pack]);

  if (pack === undefined || publicId === undefined) {
    return <div>Pack data unavailable.</div>;
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentDeckList);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <Link
          to="/packs/$packId"
          params={{
            packId: publicId,
          }}
        >
          {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
          <CardTitle>{pack.name.replace(/\((\d+)\)/g, "$1")}</CardTitle>
          <CardDescription>{pack.code}</CardDescription>
        </Link>
        <CardAction>
          <Button
            size="sm"
            variant="secondary"
            onClick={copyToClipboard}
            className="cursor-pointer"
          >
            <Clipboard />
          </Button>
        </CardAction>
      </CardHeader>

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
                {card.count} {card.name}
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
