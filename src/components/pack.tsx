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
import {
  cn,
  determinePackColors,
  makeDeckListString,
  type MtgColor,
  populateDeckList,
} from "@/lib/utils.ts";
import { useCallback, useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import DeckList from "@/components/deck-list.tsx";
import ColorIcons from "@/components/color-icons.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";
import { themeCardQueryOptions } from "@/lib/queries.ts";
import { useThemeCardPreloader } from "@/hooks/use-theme-card-preloader.ts";

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

  const queryClient = useQueryClient();
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  const handleMouseEnter = useCallback(async () => {
    if (pack && publicId) {
      // remove trailing numbers for improved query caching
      const themeName = pack.name.replace(/\s+\d+$|\s*\(\d+\)$/, "").trim();
      const themeCard = await queryClient.fetchQuery(
        themeCardQueryOptions(themeName, pack.code),
      );

      if (themeCard) {
        setCurrentSidebarCard(themeCard);
      }
    }
  }, [pack, publicId, queryClient, setCurrentSidebarCard]);

  useThemeCardPreloader(pack);

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  return (
    <Card
      className={cn(
        "bg-card w-128 max-w-full border-t-8",
        CARD_BORDER_CLASSES[mainColor],
      )}
    >
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
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
              {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
              {pack.name.replace(/\((\d+)\)/g, "$1")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {pack.code}
            </CardDescription>
          </div>
        </Link>
        <div className="flex grow items-center gap-2">
          <ColorIcons packColors={packColors} />
        </div>
        <CardAction className="flex gap-2">
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
            variant="default"
            textToCopy={currentDeckList}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <DeckList pack={pack} />
      </CardContent>
    </Card>
  );
}

export default Pack;
