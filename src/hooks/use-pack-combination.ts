import { useMemo } from "react";
import {
  determinePackColors,
  getDeckList,
  MTG_COLOR_MAP,
  type MtgColor,
  stripThemeName,
} from "@/lib/utils.ts";
import type { PackFile } from "@/lib/types.ts";
import type React from "react";

export function usePackCombination(pack1?: PackFile, pack2?: PackFile) {
  return useMemo(() => {
    if (!pack1 || !pack2) {
      return {
        comboName: "",
        deckListString: "",
        bgGradientColors: {} as React.CSSProperties,
      };
    }

    const comboName = `${stripThemeName(pack1.data.name)} + ${stripThemeName(pack2.data.name)}`;
    const deckListString = getDeckList(pack1, pack2);

    const pack1Colors = determinePackColors(pack1.data);
    const pack2Colors = determinePackColors(pack2.data);

    const colorCode1 = (pack1Colors[0]?.color ?? "C") as MtgColor;
    const colorCode2 = (pack2Colors[0]?.color ?? "C") as MtgColor;

    const bgGradientColors = {
      "--gradient-start": MTG_COLOR_MAP[colorCode1],
      "--gradient-end": MTG_COLOR_MAP[colorCode2],
    } as React.CSSProperties;

    return {
      comboName,
      deckListString,
      bgGradientColors,
    };
  }, [pack1, pack2]);
}
