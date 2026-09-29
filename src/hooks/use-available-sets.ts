import { useSuspenseQueries } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useMemo } from "react";

import { setFilterAtom } from "@/lib/atoms.ts";
import { packsQueryOptions, setMetadataQueryOptions } from "@/lib/queries.ts";
import { getSelectedSetCodes } from "@/lib/utils.ts";

export function useAvailableSets() {
  const [{ data: packs }, { data: sets }] = useSuspenseQueries({
    queries: [packsQueryOptions, setMetadataQueryOptions],
  });
  const [storedSetFilter, setSetFilter] = useAtom(setFilterAtom);
  const setFilter = useMemo(
    () => getSelectedSetCodes(storedSetFilter, sets),
    [storedSetFilter, sets]
  );

  return { packs, sets, setFilter, setSetFilter };
}
