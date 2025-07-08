import { queryOptions } from "@tanstack/react-query";
import {
  fetchAllPacks,
  fetchJson,
  fetchPack,
  fetchThemeCard,
} from "@/lib/utils.ts";
import type { PackIndexData } from "@/lib/types.ts";

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

export const themeCardQueryOptions = (themeName: string, setCode: string) =>
  queryOptions({
    queryKey: ["themeCard", themeName, setCode],
    queryFn: () => fetchThemeCard(themeName, setCode),
    staleTime: Infinity,
  });
