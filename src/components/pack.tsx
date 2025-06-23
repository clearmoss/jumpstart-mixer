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
import { BASEPATH, makeDeckListString, populateDeckList } from "@/lib/utils.ts";
import { useEffect, useState } from "react";
import CopyButton from "@/components/copy-button.tsx";

const COLOR_ORDER = { W: 0, U: 1, B: 2, R: 3, G: 4, C: 5 } as const;
type MtgColor = keyof typeof COLOR_ORDER;

const CARD_BORDER_CLASSES: Record<MtgColor, string> = {
  W: "border-t-amber-300",
  U: "border-t-sky-500",
  B: "border-t-neutral-700",
  R: "border-t-red-500",
  G: "border-t-green-500",
  C: "border-t-gray-400",
} as const;

function determinePackColors(pack: Deck): { color: string; count: number }[] {
  const colorCounts: Record<string, number> = {};

  for (const card of pack.mainBoard) {
    if (card.colorIdentity.length > 0) {
      for (const color of card.colorIdentity) {
        if (colorCounts[color] === undefined) {
          colorCounts[color] = card.count;
        } else {
          colorCounts[color] += card.count;
        }
      }
    } else {
      // the card is colorless
      if (colorCounts["C"] === undefined) {
        colorCounts["C"] = card.count;
      } else {
        colorCounts["C"] += card.count;
      }
    }
  }

  // return the colors sorted by frequency
  return Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff === 0) {
        // If counts are equal, sort by color
        return (
          COLOR_ORDER[a.color as MtgColor] - COLOR_ORDER[b.color as MtgColor]
        );
      }
      return countDiff;
    });
}

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

  const packColors = determinePackColors(pack);
  const colorIcons = packColors.map((color, index) => (
    <img
      src={`${BASEPATH}/icons/${color.color}.svg`}
      alt={color.color}
      key={color.color}
      className={index === 0 ? "h-7 w-7" : "h-5 w-5"}
    />
  ));

  return (
    <Card
      className={`bg-card border-t-10 ${
        packColors.length > 0
          ? CARD_BORDER_CLASSES[packColors[0].color as MtgColor]
          : ""
      }`}
    >
      <CardHeader>
        <Link
          to="/packs/$packId"
          params={{
            packId: publicId,
          }}
          className="flex items-start gap-8"
        >
          <div>
            <CardTitle className="flex items-center gap-4">
              {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
              {pack.name.replace(/\((\d+)\)/g, "$1")}
            </CardTitle>
            <CardDescription>{pack.code}</CardDescription>
          </div>
          <div className="flex items-center gap-2">{colorIcons}</div>
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
