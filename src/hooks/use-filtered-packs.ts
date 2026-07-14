import { useAtomValue } from "jotai";
import { useSuspenseQuery } from "@tanstack/react-query";
import { packsQueryOptions } from "@/lib/queries.ts";
import {
  allowDuplicatesAtom,
  colorFilterAtom,
  packSearchFilterAtom,
  cardSearchFilterAtom,
  setFilterAtom,
} from "@/lib/atoms.ts";
import { useMemo } from "react";
import { filterPacks, stripThemeName } from "@/lib/utils.ts";
import type { PackFile } from "@/lib/types.ts";

interface UseFilteredPacksProps {
  excludeTheme?: string;
  useSearch?: boolean;
}

export function useFilteredPacks({
  excludeTheme,
  useSearch = false,
}: UseFilteredPacksProps = {}) {
  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const allowDuplicates = useAtomValue(allowDuplicatesAtom);
  const colorFilter = useAtomValue(colorFilterAtom);
  const setFilter = useAtomValue(setFilterAtom);
  const packSearchFilter = useAtomValue(packSearchFilterAtom);
  const cardSearchFilter = useAtomValue(cardSearchFilterAtom);

  return useMemo(() => {
    const validPacks: PackFile[] = filterPacks(
      packs,
      colorFilter,
      setFilter,
      useSearch ? packSearchFilter : "",
      useSearch ? cardSearchFilter : "",
    );

    if (!allowDuplicates && excludeTheme) {
      const strippedExclude = stripThemeName(excludeTheme);
      return validPacks.filter(
        (pack) => stripThemeName(pack.data.name) !== strippedExclude,
      );
    }

    return validPacks;
  }, [
    packs,
    colorFilter,
    setFilter,
    packSearchFilter,
    cardSearchFilter,
    allowDuplicates,
    excludeTheme,
    useSearch,
  ]);
}
