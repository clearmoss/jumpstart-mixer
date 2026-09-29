import { useSetAtom } from "jotai";
import { useCallback } from "react";

import type { PackFile } from "@/lib/types.ts";

import { currentSidebarCardAtom, currentSidebarDeckListAtom } from "@/lib/atoms.ts";
import { getThemeCard } from "@/lib/utils.ts";

export function usePackHover(pack: PackFile | undefined, publicId: string | undefined) {
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  const handleMouseEnter = useCallback(() => {
    if (pack && publicId) {
      setCurrentSidebarDeckList({ pack: pack.data, publicId });
      setCurrentSidebarCard(getThemeCard(pack));
    }
  }, [pack, publicId, setCurrentSidebarDeckList, setCurrentSidebarCard]);

  return { handleMouseEnter };
}
