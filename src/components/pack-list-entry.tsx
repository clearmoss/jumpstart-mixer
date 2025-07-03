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
import MediaQuery from "react-responsive";
import { useAtomValue, useSetAtom } from "jotai";
import {
  currentSidebarDeckListAtom,
  sidebarPackSlotRefAtom,
} from "@/lib/atoms.ts";
import { createPortal } from "react-dom";
import DeckList from "@/components/deck-list.tsx";

const PACK_L_BORDER_CLASSES: Record<MtgColor, string> = {
  W: "border-l-amber-300",
  U: "border-l-sky-500",
  B: "border-l-neutral-700",
  R: "border-l-red-500",
  G: "border-l-green-500",
  C: "border-l-gray-400",
} as const;

const PACK_ANIMATED_BACKGROUND_CLASSES: Record<MtgColor, string> = {
  W: "from-amber-300 to-amber-300",
  U: "from-sky-500 to-sky-500",
  B: "from-neutral-700 to-neutral-700",
  R: "from-red-500 to-red-500",
  G: "from-green-500 to-green-500",
  C: "from-gray-400 to-gray-400",
};

const PACK_TEXT_COLOR_CLASSES: Record<MtgColor, string> = {
  W: "text-black",
  U: "text-white",
  B: "text-white",
  R: "text-white",
  G: "text-black",
  C: "text-black",
};

const formatPackName = (name: string) => name.replace(/\((\d+)\)/g, "$1");

type PackListEntryProps = {
  pack: Deck | undefined;
  publicId: string | undefined;
  position?: number;
  isCurrentlyDisplayed: boolean;
};

type SidebarDeckListPreviewProps = {
  currentlyDisplayed: boolean;
  sidebarRef: HTMLDivElement | null;
  pack: Deck;
};

function SidebarDeckListPreview({
  currentlyDisplayed,
  sidebarRef,
  pack,
}: SidebarDeckListPreviewProps) {
  if (!currentlyDisplayed || !sidebarRef) {
    return null;
  }

  return (
    <MediaQuery minWidth={1024}>
      {createPortal(
        <div className="bg-popover absolute top-0 right-0 left-0 z-50 w-100 max-w-xl rounded-md border p-8 shadow-md">
          <DeckList pack={pack} />
        </div>,
        sidebarRef,
      )}
    </MediaQuery>
  );
}

function PackListEntry({
  pack,
  publicId,
  position = 1,
  isCurrentlyDisplayed,
}: PackListEntryProps) {
  const sidebarRef = useAtomValue(sidebarPackSlotRefAtom);
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);

  const packColors = useMemo(() => {
    if (!pack) return [];
    return determinePackColors(pack);
  }, [pack]);

  const currentDeckList = useMemo(() => {
    if (!pack) return "";
    const deckList: ClipboardCard[] = [];
    populateDeckList(pack, deckList);
    return makeDeckListString(deckList);
  }, [pack]);

  const handleMouseEnter = useCallback(() => {
    if (pack && publicId) {
      setCurrentSidebarDeckList({ pack, publicId });
    }
  }, [pack, publicId, setCurrentSidebarDeckList]);

  const mainColor = (packColors[0]?.color ?? "C") as MtgColor;

  if (!pack || !publicId) {
    return <div>Pack data unavailable.</div>;
  }

  return (
    <>
      <Card
        className={cn(
          "bg-card max-w-224 border-l-12 px-0 py-4 sm:py-2",
          PACK_L_BORDER_CLASSES[mainColor],
        )}
        onMouseEnter={handleMouseEnter}
      >
        <CardHeader className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-8">
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
              "bg-gradient-to-r bg-no-repeat transition-all duration-200 ease-in-out",
              isCurrentlyDisplayed
                ? "bg-[length:100%_100%]"
                : "bg-[length:0%_100%]",
              isCurrentlyDisplayed
                ? PACK_ANIMATED_BACKGROUND_CLASSES[mainColor]
                : "from-transparent",
            )}
          >
            <CardTitle
              className={cn(
                "transition-colors duration-300 ease-in-out",
                isCurrentlyDisplayed && PACK_TEXT_COLOR_CLASSES[mainColor],
              )}
            >
              {/* the numbering format from MTGJSON is inconsistent, so remove () if present: */}
              {formatPackName(pack.name)}
            </CardTitle>
          </Link>
          <CardDescription className="text-muted-foreground w-8">
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
      <SidebarDeckListPreview
        currentlyDisplayed={isCurrentlyDisplayed}
        sidebarRef={sidebarRef}
        pack={pack}
      />
    </>
  );
}

export default React.memo(PackListEntry);
