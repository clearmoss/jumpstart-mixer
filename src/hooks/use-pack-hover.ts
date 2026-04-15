import { useCallback } from "react";
import { useSetAtom } from "jotai";
import {
  currentSidebarCardAtom,
  currentSidebarDeckListAtom,
} from "@/lib/atoms.ts";
import type { CardDeck, PackFile } from "@/lib/types.ts";
import { stripThemeName } from "@/lib/utils.ts";

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
        // mock a partial CardDeck as only this data is needed to display a theme card
        name: stripThemeName(pack.data.name),
        setCode: "F" + pack.data.code,
        imageUri: pack.meta.themeCardUri,
      } as CardDeck);
    }
  }, [pack, publicId, setCurrentSidebarDeckList, setCurrentSidebarCard]);

  return { handleMouseEnter };
}
