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
  { border: string; background: string; text: string }
> = {
  W: {
    border: "border-l-amber-300",
    background: "from-amber-300 to-amber-300",
    text: "sm:text-black",
  },
  U: {
    border: "border-l-sky-500",
    background: "from-sky-500 to-sky-500",
    text: "sm:text-white",
  },
  B: {
    border: "border-l-neutral-700",
    background: "from-neutral-700 to-neutral-700",
    text: "sm:text-white",
  },
  R: {
    border: "border-l-red-500",
    background: "from-red-500 to-red-500",
    text: "sm:text-white",
  },
  G: {
    border: "border-l-green-500",
    background: "from-green-500 to-green-500",
    text: "sm:text-black",
  },
  C: {
    border: "border-l-gray-400",
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
      className={cn(
        "bg-card max-w-4xl border-l-12 px-0 py-4 sm:py-2",
        STYLE_VARIANTS[primaryColor].border,
      )}
      onMouseEnter={handleMouseEnter}
    >
      <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          to="/packs/$packId"
          params={{
            packId: publicId,
          }}
          className={cn(
            "flex max-w-56 grow items-center self-stretch",
            "-my-4 sm:-my-2", // counteract Card's vertical padding
            "py-4 sm:py-2", // add it back for the content
            "-ml-6", // counteract CardHeader's left padding
            "pl-6", // add it back for the content
            "bg-no-repeat transition-all duration-200 ease-in-out sm:bg-linear-to-r",
            isCurrentlyDisplayed ? "bg-size-[100%_100%]" : "bg-size-[0%_100%]",
            isCurrentlyDisplayed
              ? STYLE_VARIANTS[primaryColor].background
              : "from-transparent",
          )}
        >
          <CardTitle
            className={cn(
              "transition-colors duration-300 ease-in-out",
              isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].text,
            )}
            data-testid="pack-name"
          >
            {cleanThemeName(pack.data.name)}
          </CardTitle>
        </Link>
        <CardDescription
          className="text-muted-foreground w-8 pt-4 sm:pt-0"
          data-testid="pack-set"
        >
          {pack.data.code}
        </CardDescription>
        <div className="flex grow items-center gap-2 py-4 sm:py-0">
          <ColorIcons packColors={packColors} />
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
            variant="default"
            textToCopy={currentDeckList}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default React.memo(PackListEntry);
