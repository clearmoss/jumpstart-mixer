import { queryOptions } from "@tanstack/react-query";

import type { PackIndexData } from "@/lib/types.ts";

import { fetchAllPacks, fetchJson, fetchPack } from "@/lib/utils.ts";

export const packIndexQueryOptions = queryOptions({
  queryKey: ["packIndex"],
  queryFn: () => fetchJson<PackIndexData[]>("pack_index.json"),
  staleTime: Infinity,
});

export const packsQueryOptions = queryOptions({
  queryKey: ["packs"],
  queryFn: () => fetchAllPacks(),
  staleTime: Infinity,
});

export const packQueryOptions = (packId: string) =>
  queryOptions({
    queryKey: ["pack", packId],
    queryFn: () => fetchPack(packId),
    staleTime: Infinity,
  });
