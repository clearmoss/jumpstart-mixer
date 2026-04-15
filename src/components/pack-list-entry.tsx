import type { ClipboardCard, PackFile } from "@/lib/types.ts";
import {
  Card,
  CardAction,
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
  splitThemeName,
} from "@/lib/utils.ts";
import React, { useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import ColorIcons from "@/components/color-icons.tsx";
import { usePackHover } from "@/hooks/use-pack-hover.ts";
import { Badge } from "@/components/ui/badge.tsx";

const STYLE_VARIANTS: Record<
  MtgColor,
  { stripe: string; background: string; text: string }
> = {
  W: {
    stripe: "bg-amber-300",
    background: "sm:bg-amber-300",
    text: "sm:text-black",
  },
  U: {
    stripe: "bg-sky-500",
    background: "sm:bg-sky-500",
    text: "sm:text-white",
  },
  B: {
    stripe: "bg-neutral-700",
    background: "sm:bg-neutral-700",
    text: "sm:text-white",
  },
  R: {
    stripe: "bg-red-500",
    background: "sm:bg-red-500",
    text: "sm:text-white",
  },
  G: {
    stripe: "bg-green-500",
    background: "sm:bg-green-500",
    text: "sm:text-black",
  },
  C: {
    stripe: "bg-gray-400",
    background: "sm:bg-gray-400",
    text: "sm:text-black",
  },
};

type PackListEntryProps = {
  pack: PackFile | undefined;
  publicId: string | undefined;
  position?: number;
  isCurrentlyDisplayed: boolean;
};

function usePackData(pack: PackFile | undefined, publicId: string | undefined) {
  const { handleMouseEnter } = usePackHover(pack, publicId);

  const { packColors, currentDeckList, primaryColor } = useMemo(() => {
    if (!pack) {
      return {
        packColors: [],
        primaryColor: "C" as MtgColor,
        currentDeckList: "",
      };
    }

    const colors = determinePackColors(pack.data);
    const primaryColor = (colors[0]?.color ?? "C") as MtgColor;

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack.data, deckList);
    const deckListString = makeDeckListString(deckList);

    return {
      packColors: colors,
      primaryColor: primaryColor,
      currentDeckList: deckListString,
    };
  }, [pack]);

  return { packColors, primaryColor, currentDeckList, handleMouseEnter };
}

function ActionButtons({
  publicId,
  position,
  currentDeckList,
}: {
  publicId: string;
  position: number;
  currentDeckList: string;
}) {
  return (
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
}

function PackListEntry({
  pack,
  publicId,
  position = 1,
  isCurrentlyDisplayed,
}: PackListEntryProps) {
  const { packColors, primaryColor, currentDeckList, handleMouseEnter } =
    usePackData(pack, publicId);

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  const { baseName, number } = splitThemeName(pack.data.name);

  return (
    <Card
      className="bg-card relative max-w-4xl overflow-hidden border-none px-0 py-0"
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 z-10 w-3",
          STYLE_VARIANTS[primaryColor].stripe,
        )}
      />

      <CardHeader className="flex flex-col gap-0 p-0 pl-3 sm:min-h-14 sm:flex-row sm:items-stretch">
        <div className="flex w-full min-w-0 items-stretch justify-between sm:max-w-xs sm:flex-1">
          <Link
            to="/packs/$packId"
            params={{ packId: publicId }}
            className={cn(
              "flex min-w-0 grow items-center",
              "py-5 pl-3 sm:py-0",
              isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].background,
            )}
          >
            <CardTitle
              className={cn(
                "flex items-baseline truncate leading-normal",
                isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].text,
              )}
              data-testid="pack-name"
            >
              <span>{baseName}</span>
              {number && (
                <Badge
                  variant="secondary"
                  className="ml-4 h-5 w-6 rounded-md border-2 border-zinc-200 text-sm font-light dark:border-zinc-700"
                >
                  <span>{number}</span>
                </Badge>
              )}
            </CardTitle>
          </Link>

          {/* buttons for narrow screens */}
          <div className="flex shrink-0 items-center gap-2 px-4 sm:hidden">
            <ActionButtons
              publicId={publicId}
              position={position}
              currentDeckList={currentDeckList}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 pb-3 sm:flex-none sm:px-4 sm:py-0">
          <CardDescription
            className="text-muted-foreground w-10 shrink-0 pt-0"
            data-testid="pack-set"
          >
            {pack.data.code}
          </CardDescription>

          <div className="flex shrink-0 items-center gap-2">
            <ColorIcons packColors={packColors} />
          </div>
        </div>

        {/* buttons for wide screens */}
        <CardAction className="hidden shrink-0 items-center gap-2 px-6 sm:ml-auto sm:flex sm:self-stretch">
          <div className="flex items-center gap-2">
            <ActionButtons
              publicId={publicId}
              position={position}
              currentDeckList={currentDeckList}
            />
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default React.memo(PackListEntry);
