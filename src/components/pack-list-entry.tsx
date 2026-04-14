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
  cleanThemeName,
  determinePackColors,
  makeDeckListString,
  type MtgColor,
  populateDeckList,
} from "@/lib/utils.ts";
import React, { useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import ColorIcons from "@/components/color-icons.tsx";
import { usePackHover } from "@/hooks/use-pack-hover.ts";

const STYLE_VARIANTS: Record<
  MtgColor,
  { stripe: string; background: string; text: string }
> = {
  W: {
    stripe: "bg-amber-300",
    background: "from-amber-300 to-amber-300",
    text: "sm:text-black",
  },
  U: {
    stripe: "bg-sky-500",
    background: "from-sky-500 to-sky-500",
    text: "sm:text-white",
  },
  B: {
    stripe: "bg-neutral-700",
    background: "from-neutral-700 to-neutral-700",
    text: "sm:text-white",
  },
  R: {
    stripe: "bg-red-500",
    background: "from-red-500 to-red-500",
    text: "sm:text-white",
  },
  G: {
    stripe: "bg-green-500",
    background: "from-green-500 to-green-500",
    text: "sm:text-black",
  },
  C: {
    stripe: "bg-gray-400",
    background: "from-gray-400 to-gray-400",
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
              "flex min-w-0 grow items-center transition-all duration-300 ease-in-out sm:bg-linear-to-r",
              "py-5 pl-3 sm:py-0",
              "bg-left bg-no-repeat",
              isCurrentlyDisplayed
                ? "bg-size-[100%_100%]"
                : "bg-size-[0%_100%]",
              isCurrentlyDisplayed
                ? STYLE_VARIANTS[primaryColor].background
                : "from-transparent to-transparent",
            )}
          >
            <CardTitle
              className={cn(
                "truncate leading-normal transition-colors duration-300 ease-in-out",
                isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].text,
              )}
              data-testid="pack-name"
            >
              {cleanThemeName(pack.data.name)}
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

        <div className="flex items-center gap-4 px-6 py-3 sm:flex-none sm:px-4 sm:py-0">
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
