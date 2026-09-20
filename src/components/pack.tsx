import { Link } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { useMemo } from "react";

import type { PackFile } from "@/lib/types.ts";

import ColorIcons from "@/components/color-icons.tsx";
import CopyButton from "@/components/copy-button.tsx";
import DeckList from "@/components/deck-list.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { usePackHover } from "@/hooks/use-pack-hover.ts";
import {
  cn,
  determinePackColors,
  getDeckList,
  MTG_COLOR_MAP,
  type MtgColor,
  splitThemeName,
} from "@/lib/utils.ts";

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
    return getDeckList(pack);
  }, [pack]);

  const packColors = useMemo(() => (pack ? determinePackColors(pack.data) : []), [pack]);
  const mainColor = (packColors[0]?.color ?? "C") as MtgColor;

  const { handleMouseEnter } = usePackHover(pack, publicId);

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  const { baseName, number } = splitThemeName(pack.data.name);

  const ActionButtons = (
    <>
      <Link
        to="/mixer"
        preload={false}
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
      className={cn("w-full flex-1 border-t-8 bg-card")}
      style={{ borderTopColor: MTG_COLOR_MAP[mainColor] }}
    >
      <CardHeader className="flex flex-col px-6">
        <div
          className="flex w-full min-w-0 items-center justify-between gap-4"
          onMouseEnter={handleMouseEnter}
        >
          <Link
            to="/packs/$packId"
            params={{
              packId: publicId,
            }}
            className="min-w-0 flex-1"
          >
            <CardTitle className="flex min-h-8 min-w-0 items-center gap-2 leading-tight sm:gap-4">
              <span className="truncate text-lg">{baseName}</span>
              {number && (
                <Badge
                  variant="secondary"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-zinc-200 p-0 text-sm font-light dark:border-zinc-700"
                >
                  {number}
                </Badge>
              )}
              <Badge variant="secondary" className="h-6 w-12 p-2">
                {pack.data.code}
              </Badge>
            </CardTitle>
          </Link>
        </div>

        <div className="my-2 h-px w-full bg-border" />

        <CardDescription className="flex w-full items-center justify-between gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <ColorIcons packColors={packColors} />
          </div>
          <div className="flex shrink-0 items-center gap-2">{ActionButtons}</div>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <DeckList pack={pack.data} />
      </CardContent>
    </Card>
  );
}

export default Pack;
