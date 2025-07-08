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
  cn,
  determinePackColors,
  makeDeckListString,
  type MtgColor,
  populateDeckList,
} from "@/lib/utils.ts";
import React, { useCallback, useMemo } from "react";
import CopyButton from "@/components/copy-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import ColorIcons from "@/components/color-icons.tsx";
import { useSetAtom } from "jotai";
import {
  currentSidebarCardAtom,
  currentSidebarDeckListAtom,
} from "@/lib/atoms.ts";
import { useQueryClient } from "@tanstack/react-query";
import { themeCardQueryOptions } from "@/lib/queries.ts";

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
  pack: Deck | undefined;
  publicId: string | undefined;
  position?: number;
  isCurrentlyDisplayed: boolean;
};

function usePackData(pack: Deck | undefined, publicId: string | undefined) {
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);
  const queryClient = useQueryClient();

  const { packColors, currentDeckList, primaryColor } = useMemo(() => {
    if (!pack) {
      return {
        packColors: [],
        primaryColor: "C" as MtgColor,
        currentDeckList: "",
      };
    }

    const colors = determinePackColors(pack);
    const primaryColor = (colors[0]?.color ?? "C") as MtgColor;

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack, deckList);
    const deckListString = makeDeckListString(deckList);

    return {
      packColors: colors,
      primaryColor: primaryColor,
      currentDeckList: deckListString,
    };
  }, [pack]);

  const handleMouseEnter = useCallback(async () => {
    if (pack && publicId) {
      setCurrentSidebarDeckList({ pack, publicId });

      // remove trailing numbers for improved query caching
      const themeName = pack.name.replace(/\s+\d+$|\s*\(\d+\)$/, "").trim();
      const themeCard = await queryClient.fetchQuery(
        themeCardQueryOptions(themeName, pack.code),
      );

      if (themeCard) {
        setCurrentSidebarCard(themeCard);
      }
    }
  }, [
    pack,
    publicId,
    setCurrentSidebarDeckList,
    queryClient,
    setCurrentSidebarCard,
  ]);

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
        "bg-card max-w-224 border-l-12 px-0 py-4 sm:py-2",
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
            "bg-no-repeat transition-all duration-200 ease-in-out sm:bg-gradient-to-r",
            isCurrentlyDisplayed
              ? "bg-[length:100%_100%]"
              : "bg-[length:0%_100%]",
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
          >
            {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
            {pack.name.replace(/\((\d+)\)/g, "$1")}
          </CardTitle>
        </Link>
        <CardDescription className="text-muted-foreground w-8 pt-4 sm:pt-0">
          {pack.code}
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
            variant="secondary"
            textToCopy={currentDeckList}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default React.memo(PackListEntry);
