import type { ClipboardCard, PackFile } from "@/lib/types.ts";
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
  cn,
  cleanThemeName,
  determinePackColors,
  makeDeckListString,
  type MtgColor,
  populateDeckList,
} from "@/lib/utils.ts";
import { useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import DeckList from "@/components/deck-list.tsx";
import ColorIcons from "@/components/color-icons.tsx";
import { usePackHover } from "@/hooks/use-pack-hover.ts";

const CARD_BORDER_CLASSES: Record<MtgColor, string> = {
  W: "border-t-amber-300",
  U: "border-t-sky-500",
  B: "border-t-neutral-700",
  R: "border-t-red-500",
  G: "border-t-green-500",
  C: "border-t-gray-400",
} as const;

function Pack({
  pack,
  publicId,
  position = 1,
}: {
  pack: PackFile | undefined;
  publicId: string | undefined;
  position?: number;
}) {
  const currentDeckList = useMemo(() => {
    if (!pack) return "";
    const deckList: ClipboardCard[] = [];
    populateDeckList(pack.data, deckList);
    return makeDeckListString(deckList);
  }, [pack]);

  const packColors = useMemo(
    () => (pack ? determinePackColors(pack.data) : []),
    [pack],
  );
  const mainColor = (packColors[0]?.color ?? "C") as MtgColor;

  const { handleMouseEnter } = usePackHover(pack, publicId);

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  const ActionButtons = (
    <>
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
          <Shuffle className="h-4 w-4" />
        </Button>
      </Link>
      <CopyButton size="sm" variant="default" textToCopy={currentDeckList} />
    </>
  );

  return (
    <Card
      className={cn(
        "bg-card w-lg max-w-full border-t-8",
        CARD_BORDER_CLASSES[mainColor],
      )}
    >
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex w-full items-start justify-between sm:w-auto sm:justify-start">
          <Link
            to="/packs/$packId"
            params={{
              packId: publicId,
            }}
            className="flex items-start gap-8"
            onMouseEnter={handleMouseEnter}
          >
            <div>
              <CardTitle className="flex items-center gap-4">
                {cleanThemeName(pack.data.name)}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {pack.data.code}
              </CardDescription>
            </div>
          </Link>

          {/* buttons for narrow screens */}
          <div className="flex gap-2 sm:hidden">{ActionButtons}</div>
        </div>

        <div className="flex items-center gap-2 sm:grow">
          <ColorIcons packColors={packColors} />
        </div>

        {/* buttons for wide screens */}
        <CardAction className="hidden gap-2 sm:ml-auto sm:flex">
          {ActionButtons}
        </CardAction>
      </CardHeader>
      <CardContent>
        <DeckList pack={pack.data} />
      </CardContent>
    </Card>
  );
}

export default Pack;
