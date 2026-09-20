import { Link } from "@tanstack/react-router";
import { atom, useAtomValue } from "jotai";
import { Shuffle } from "lucide-react";
import React, { useMemo } from "react";

import type { PackFile } from "@/lib/types.ts";

import ColorIcons from "@/components/color-icons.tsx";
import CopyButton from "@/components/copy-button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button, type ButtonVariant } from "@/components/ui/button.tsx";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { usePackHover } from "@/hooks/use-pack-hover.ts";
import { currentSidebarDeckListAtom } from "@/lib/atoms.ts";
import {
  cn,
  determinePackColors,
  getDeckList,
  type MtgColor,
  splitThemeName,
} from "@/lib/utils.ts";

const STYLE_VARIANTS: Record<
  MtgColor,
  { stripe: string; background: string; text: string; button: ButtonVariant }
> = {
  W: {
    stripe: "bg-mtg-white",
    background: "bg-mtg-white",
    text: "text-black",
    button: "mtg-white",
  },
  U: {
    stripe: "bg-mtg-blue",
    background: "bg-mtg-blue",
    text: "text-white",
    button: "mtg-blue",
  },
  B: {
    stripe: "bg-mtg-black",
    background: "bg-mtg-black",
    text: "text-white",
    button: "mtg-black",
  },
  R: {
    stripe: "bg-mtg-red",
    background: "bg-mtg-red",
    text: "text-white",
    button: "mtg-red",
  },
  G: {
    stripe: "bg-mtg-green",
    background: "bg-mtg-green",
    text: "text-white",
    button: "mtg-green",
  },
  C: {
    stripe: "bg-mtg-colorless",
    background: "bg-mtg-colorless",
    text: "text-black",
    button: "mtg-colorless",
  },
};

type PackListEntryProps = {
  pack: PackFile | undefined;
  publicId: string | undefined;
  position?: number;
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
    const determinedPrimaryColor = (colors[0]?.color ?? "C") as MtgColor;
    const deckListString = getDeckList(pack);

    return {
      packColors: colors,
      primaryColor: determinedPrimaryColor,
      currentDeckList: deckListString,
    };
  }, [pack]);

  return { packColors, primaryColor, currentDeckList, handleMouseEnter };
}

function ActionButtons({
  publicId,
  position,
  currentDeckList,
  variant,
}: {
  publicId: string;
  position: number;
  currentDeckList: string;
  variant: ButtonVariant;
}) {
  return (
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
        <Button size="sm" variant={variant} className="cursor-pointer border-2 transition-none">
          <Shuffle className="h-4 w-4" />
        </Button>
      </Link>
      <CopyButton
        size="sm"
        variant={variant}
        textToCopy={currentDeckList}
        className="border-2 transition-none"
      />
    </>
  );
}

function PackListEntry({ pack, publicId, position = 1 }: PackListEntryProps) {
  // keep sidebar subscription local to avoid rerendering other packs
  const isDisplayedAtom = useMemo(
    () => atom((get) => get(currentSidebarDeckListAtom).publicId === publicId),
    [publicId]
  );
  const isCurrentlyDisplayed = useAtomValue(isDisplayedAtom);
  const { packColors, primaryColor, currentDeckList, handleMouseEnter } = usePackData(
    pack,
    publicId
  );

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  const { baseName, number } = splitThemeName(pack.data.name);
  const actionButtonVariant = isCurrentlyDisplayed
    ? STYLE_VARIANTS[primaryColor].button
    : "outline";

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-none bg-card px-0 py-0",
        isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].background
      )}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 z-10 w-3",
          STYLE_VARIANTS[primaryColor].stripe
        )}
      />

      <CardHeader className="flex flex-col gap-0 p-0 pl-3 sm:min-h-14 sm:flex-row sm:items-stretch">
        <div className="flex w-full min-w-0 items-stretch justify-between sm:min-w-0 sm:flex-1">
          <Link
            to="/packs/$packId"
            preload={false}
            params={{ packId: publicId }}
            className={cn("flex min-w-0 grow items-center", "py-2 pl-3 sm:py-0")}
          >
            <CardTitle
              className={cn(
                "flex min-h-8 min-w-0 items-center py-1 leading-tight",
                isCurrentlyDisplayed && STYLE_VARIANTS[primaryColor].text
              )}
              data-testid="pack-name"
            >
              <span className="truncate">{baseName}</span>
              {number && (
                <Badge
                  variant="secondary"
                  className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-md p-0 text-sm font-light"
                >
                  {number}
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
              variant={actionButtonVariant}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 px-3 pb-3 sm:w-60 sm:flex-none sm:px-4 sm:py-0">
          <CardDescription
            className="w-12 shrink-0 pt-0 text-muted-foreground"
            data-testid="pack-set"
          >
            <Badge variant="secondary" className="h-6 w-12 p-2">
              {pack.data.code}
            </Badge>
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
              variant={actionButtonVariant}
            />
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

export default React.memo(PackListEntry);
