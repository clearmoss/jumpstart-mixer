import type { ClipboardCard, Deck } from "@/lib/types.ts";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "@tanstack/react-router";
import {
  BASEPATH,
  determinePackColors,
  makeDeckListString,
  type MtgColor,
  populateDeckList,
} from "@/lib/utils.ts";
import { useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";

const CARD_BORDER_CLASSES: Record<MtgColor, string> = {
  W: "border-l-amber-300",
  U: "border-l-sky-500",
  B: "border-l-neutral-700",
  R: "border-l-red-500",
  G: "border-l-green-500",
  C: "border-l-gray-400",
} as const;

function PackListEntry({
  pack,
  publicId,
  position = 1,
}: {
  pack: Deck | undefined;
  publicId: string | undefined;
  position?: number;
}) {
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

  const mainColor = (packColors[0]?.color ?? "C") as MtgColor;
  const colorIcons = useMemo(
    () =>
      packColors.map((color, index) => (
        <img
          src={`${BASEPATH}/icons/${color.color}.svg`}
          alt={color.color}
          key={color.color}
          className={"select-none " + (index === 0 ? "h-7 w-7" : "h-5 w-5")}
        />
      )),
    [packColors],
  );

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  return (
    <Card
      className={`bg-card max-w-224 border-l-12 px-0 py-4 sm:py-2 ${CARD_BORDER_CLASSES[mainColor]}`}
    >
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
        <Link
          to="/packs/$packId"
          params={{
            packId: publicId,
          }}
        >
          <div className="flex flex-col items-baseline sm:flex-row sm:gap-8">
            <CardTitle>
              {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
              {pack.name.replace(/\((\d+)\)/g, "$1")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {pack.code}
            </CardDescription>
          </div>
        </Link>
        <div className="flex grow items-center justify-end gap-2">
          {colorIcons}
        </div>
        <CardAction className="flex items-center gap-2">
          <Link
            to="/mixer"
            title="Mix with this pack"
            search={
              position === 1
                ? { packId1: publicId, packId2: undefined }
                : { packId1: undefined, packId2: publicId }
            }
          >
            <Button size="sm" variant="secondary" className="cursor-pointer">
              <Shuffle />
            </Button>
          </Link>
          <CopyButton
            size="sm"
            variant="secondary"
            textToCopy={currentDeckList}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default PackListEntry;
