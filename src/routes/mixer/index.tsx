import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { ClipboardCard } from "@/lib/types.ts";
import {
  fetchAllPacks,
  handleError,
  makeDeckListString,
  populateDeckList,
} from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";
import { useQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";

export const Route = createFileRoute("/mixer/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      packId1: (search.packId1 as string) || undefined,
      packId2: (search.packId2 as string) || undefined,
    };
  },
  errorComponent: ({ error }) => {
    const message = handleError(error);
    return <div>Error: {message}</div>;
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  const packs = useQuery({
    queryKey: ["packs"],
    queryFn: fetchAllPacks,
    staleTime: Infinity,
  });

  // local state to manage the displayed packs for instant randomization
  const [localPackIds, setLocalPackIds] = useState({
    packId1: searchParams.packId1,
    packId2: searchParams.packId2,
  });

  // sync the local state if the URL changes
  useEffect(() => {
    setLocalPackIds({
      packId1: searchParams.packId1,
      packId2: searchParams.packId2,
    });
  }, [searchParams.packId1, searchParams.packId2]);

  // memoize packs from the local state
  const { pack1, pack2 } = useMemo(() => {
    if (!packs.data) return { pack1: undefined, pack2: undefined };
    const p1 = packs.data.find((p) => p.meta.publicId === localPackIds.packId1);
    const p2 = packs.data.find((p) => p.meta.publicId === localPackIds.packId2);
    return { pack1: p1, pack2: p2 };
  }, [localPackIds.packId1, localPackIds.packId2, packs.data]);

  // memoize decklist string for the clipboard copy
  const currentDeckList = useMemo(() => {
    if (!pack1 || !pack2) return "";

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack1.data, deckList);
    populateDeckList(pack2.data, deckList);
    return makeDeckListString(deckList);
  }, [pack1, pack2]);

  const mixPacks = useCallback(() => {
    if (!packs.data) return;
    if (packs.data.length < 2) return; // too few packs

    const randomIndex1 = Math.floor(Math.random() * packs.data.length);
    let randomIndex2 = Math.floor(Math.random() * packs.data.length);

    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.data.length);
    }

    const newPackId1 = packs.data[randomIndex1].meta.publicId;
    const newPackId2 = packs.data[randomIndex2].meta.publicId;

    // update local state for instant change
    setLocalPackIds({ packId1: newPackId1, packId2: newPackId2 });
    // synchronize the URL
    navigate({
      search: { packId1: newPackId1, packId2: newPackId2 },
      replace: true,
    }).then();
  }, [packs.data, navigate]);

  useEffect(() => {
    if (!packs.data) return;
    if (packs.data.length < 2) return;

    const hasNoPacks = !searchParams.packId1 && !searchParams.packId2;
    const hasOnlyOnePack =
      Boolean(searchParams.packId1) !== Boolean(searchParams.packId2);

    if (hasNoPacks) {
      mixPacks();
      return;
    }

    if (hasOnlyOnePack) {
      const givenId = searchParams.packId1 || searchParams.packId2;
      const givenPackIndex = packs.data.findIndex(
        (p) => p.meta.publicId === givenId,
      );

      if (givenPackIndex === -1) {
        // the single pack ID from the URL is invalid, so get two new random packs
        // mixPacks();
        return;
      }

      let randomPackIndex = Math.floor(Math.random() * packs.data.length);
      while (randomPackIndex === givenPackIndex) {
        randomPackIndex = Math.floor(Math.random() * packs.data.length);
      }
      const randomPack = packs.data[randomPackIndex];

      const newPackId1 = searchParams.packId1 || randomPack.meta.publicId;
      const newPackId2 = searchParams.packId2 || randomPack.meta.publicId;

      // update local state for instant change
      setLocalPackIds({ packId1: newPackId1, packId2: newPackId2 });
      // synchronize the URL
      navigate({
        search: { packId1: newPackId1, packId2: newPackId2 },
        replace: true,
      }).then();
    }
  }, [searchParams, packs.data, mixPacks, navigate]);

  if (packs.isLoading) return <div>Loading packs...</div>;
  if (packs.isError || packs.data === undefined) return <div>Error</div>;

  return (
    <>
      <h1 className="pb-8 text-3xl">Mixer</h1>
      <div className="mb-8 flex items-center gap-4">
        <Button size="sm" onClick={mixPacks} className="cursor-pointer">
          <Shuffle />
          Randomize Packs
        </Button>
        <CopyButton
          size="sm"
          textToCopy={currentDeckList}
          buttonText="Copy Decklist"
        />
        <CategoriesToggle />
      </div>
      {pack1 && pack2 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Pack pack={pack1.data} publicId={pack1.meta.publicId} />
          <Pack pack={pack2.data} publicId={pack2.meta.publicId} />
        </div>
      ) : (
        <div>Pack data unavailable.</div>
      )}
    </>
  );
}
