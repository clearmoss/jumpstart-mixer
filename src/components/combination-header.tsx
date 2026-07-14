import React from "react";
import { cn } from "@/lib/utils.ts";
import { usePackCombination } from "@/hooks/use-pack-combination.ts";
import type { PackFile } from "@/lib/types.ts";

interface CombinationHeaderProps {
  pack1?: PackFile;
  pack2?: PackFile;
  comboName?: string;
  bgGradientColors?: React.CSSProperties;
}

export function CombinationHeader({
  pack1,
  pack2,
  comboName: propComboName,
  bgGradientColors: propBgGradientColors,
}: CombinationHeaderProps) {
  const combination = usePackCombination(pack1, pack2);

  const finalComboName = propComboName ?? combination.comboName;
  const finalBgGradientColors = propBgGradientColors ?? combination.bgGradientColors;

  if (!finalComboName) return null;

  return (
    <div
      style={finalBgGradientColors}
      className={cn(
        "flex w-full max-w-3xl items-center justify-center gap-4 rounded-xl px-6 py-4",
        "bg-linear-[to_right,var(--gradient-start)_30%,var(--gradient-end)_70%]",
      )}
    >
      <h1 className="text-3xl font-bold text-white text-shadow-md text-center">
        {finalComboName}
      </h1>
    </div>
  );
}
