import type { CardDeck, ClipboardCard, Deck } from "@/lib/types.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "@tanstack/react-router";
import {
  BASEPATH,
  cn,
  makeDeckListString,
  populateDeckList,
} from "@/lib/utils.ts";
import { useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { useAtom } from "jotai/index";
import { showCategoriesAtom } from "@/lib/atoms.ts";
import CardListEntry from "@/components/card-list-entry.tsx";

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
  const colorCounts = pack.mainBoard.reduce(
    (acc, card) => {
      // if the card has colors, use them; otherwise use colorless ("C")
      const colors = card.colorIdentity.length > 0 ? card.colorIdentity : ["C"];
      for (const color of colors) {
        // accumulate total count
        acc[color as MtgColor] = (acc[color as MtgColor] || 0) + card.count;
      }
      return acc;
    },
    {} as Record<MtgColor, number>,
  );

  // return the colors sorted by frequency
  return Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff === 0) {
        // if counts are equal, sort by color
        return (
          COLOR_ORDER[a.color as MtgColor] - COLOR_ORDER[b.color as MtgColor]
        );
      }
      return countDiff;
    });
}

function getMainType(type: string): string {
  // remove the subtype after —, then return only the main type without specifier
  const mainType = type.split("—")[0].trim().split(" ").pop();
  return mainType ? mainType : "Unknown";
}

function groupCardsByType(cards: CardDeck[]): Map<string, CardDeck[]> {
  return cards.reduce((groups, card) => {
    const mainType = getMainType(card.type);

    if (!groups.has(mainType)) {
      groups.set(mainType, []);
    }
    groups.get(mainType)!.push(card);
    return groups;
  }, new Map<string, CardDeck[]>());
}

function Pack({
  pack,
  publicId,
}: {
  pack: Deck | undefined;
  publicId: string | undefined;
}) {
  const [showCategories] = useAtom(showCategoriesAtom);

  const currentDeckList = useMemo(() => {
    if (!pack) return "";
    const deckList: ClipboardCard[] = [];
    populateDeckList(pack, deckList);
    return makeDeckListString(deckList);
  }, [pack]);

  const packColors = useMemo(
    () => (pack ? determinePackColors(pack) : []),
    [pack],
  );

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  const mainColor = (packColors[0]?.color ?? "C") as MtgColor;
  const colorIcons = packColors.map((color, index) => (
    <img
      src={`${BASEPATH}/icons/${color.color}.svg`}
      alt={color.color}
      key={color.color}
      className={"select-none " + (index === 0 ? "h-7 w-7" : "h-5 w-5")}
    />
  ));

  const groupedCards = groupCardsByType(pack.mainBoard);
  const typeOrder = [
    "Legendary Planeswalker",
    "Planeswalker",
    "Legendary Creature",
    "Creature",
    "Artifact Creature",
    "Enchantment Creature",
    "Instant",
    "Sorcery",
    "Artifact",
    "Legendary Enchantment",
    "Enchantment",
    "Land",
  ];
  const sortedTypes = Array.from(groupedCards.keys()).sort((a, b) => {
    const aIndex = typeOrder.indexOf(a);
    const bIndex = typeOrder.indexOf(b);
    // if both types are in the order array, use that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // if only one type is in the order array, put it first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // if neither type is in the order array, sort alphabetically
    return a.localeCompare(b);
  });

  return (
    <Card className={`bg-card border-t-8 ${CARD_BORDER_CLASSES[mainColor]}`}>
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
            <CardDescription className="text-muted-foreground">
              {pack.code}
            </CardDescription>
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
      <CardContent className={cn("flex flex-col", showCategories && "gap-4")}>
        {sortedTypes.map((type) => (
          <div key={type}>
            <h3
              className={cn(
                "text-muted-foreground text-sm font-semibold",
                !showCategories && "hidden",
              )}
            >
              {type} ({groupedCards.get(type)?.length})
            </h3>
            <ul className={cn(showCategories && "ml-2")}>
              {groupedCards.get(type)?.map((card) => (
                <CardListEntry card={card} key={card.identifiers.scryfallId} />
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default Pack;
