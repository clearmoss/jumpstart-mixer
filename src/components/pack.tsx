import type { ClipboardCard, Deck } from "@/lib/types.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "@tanstack/react-router";
import { makeDeckListString, populateDeckList } from "@/lib/utils.ts";
import { useEffect, useState } from "react";
import CopyButton from "@/components/copy-button.tsx";

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
          <CopyButton
            size="sm"
            variant="secondary"
            textToCopy={currentDeckList}
          />
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
    </Card>
  );
}

export default Pack;
