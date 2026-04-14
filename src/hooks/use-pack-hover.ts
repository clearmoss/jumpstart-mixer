import { useCallback } from "react";
import { useSetAtom } from "jotai";
import {
  currentSidebarCardAtom,
  currentSidebarDeckListAtom,
} from "@/lib/atoms.ts";
import type { CardDeck, PackFile } from "@/lib/types.ts";

export function usePackHover(
  pack: PackFile | undefined,
  publicId: string | undefined,
) {
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  const handleMouseEnter = useCallback(async () => {
    if (pack && publicId) {
      setCurrentSidebarDeckList({ pack: pack.data, publicId });
      setCurrentSidebarCard({
        // mock a partial CardDeck as only the imageUri is needed to display a theme card
        imageUri: pack.meta.themeCardUri,
      } as CardDeck);
    }
  }, [pack, publicId, setCurrentSidebarDeckList, setCurrentSidebarCard]);

  return { handleMouseEnter };
}
