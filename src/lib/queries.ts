import { queryOptions } from "@tanstack/react-query";

import type { PackIndex, SetMetadata } from "@/lib/types.ts";

import {
  fetchAllPacks,
  fetchJson,
  fetchPack,
  getSetCodesFromPackIndex,
  sortSetMetadata,
} from "@/lib/utils.ts";

// increment when public pack data changes so persisted queries are refreshed
const PACK_DATA_VERSION = 2;

export const packIndexQueryOptions = queryOptions({
  queryKey: ["packIndex", PACK_DATA_VERSION],
  queryFn: () => fetchJson<PackIndex>("pack_index.json"),
  staleTime: Infinity,
});

export const packsQueryOptions = queryOptions({
  queryKey: ["packs", PACK_DATA_VERSION],
  queryFn: async ({ client }) => {
    const packIndex = await client.query(packIndexQueryOptions);
    return fetchAllPacks(packIndex);
  },
  staleTime: Infinity,
});

export const setMetadataQueryOptions = queryOptions({
  queryKey: ["setMetadata", PACK_DATA_VERSION],
  queryFn: async ({ client }) => {
    const packIndex = await client.query(packIndexQueryOptions);
    const setCodes = getSetCodesFromPackIndex(packIndex);
    const sets = await Promise.all(
      setCodes.map(async (code) => {
        const metadata = await fetchJson<SetMetadata>(`packs/${code}/set.json`);
        if (
          metadata.code !== code ||
          typeof metadata.name !== "string" ||
          typeof metadata.releaseDate !== "string"
        ) {
          throw new Error(`Invalid set metadata for "${code}" in packs/${code}/set.json.`);
        }
        return metadata;
      })
    );

    return sortSetMetadata(sets);
  },
  staleTime: Infinity,
});

export const packQueryOptions = (packId: string) =>
  queryOptions({
    queryKey: ["pack", packId, PACK_DATA_VERSION],
    queryFn: () => fetchPack(packId),
    staleTime: Infinity,
  });
