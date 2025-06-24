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

export const Route = createFileRoute("/mixer/")({
  component: RouteComponent,
  loader: async () => {
    const packs = await fetchAllPacks();
    return { packs };
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      packId1: (search.packId1 as string) || undefined,
      packId2: (search.packId2 as string) || undefined,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: ({ error }) => {
    const message = handleError(error);
    return <div>Error: {message}</div>;
  },
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const searchParams = Route.useSearch();
  const { packs } = Route.useLoaderData();

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
    const p1 = packs.find((p) => p.meta.publicId === localPackIds.packId1);
    const p2 = packs.find((p) => p.meta.publicId === localPackIds.packId2);
    return { pack1: p1, pack2: p2 };
  }, [localPackIds.packId1, localPackIds.packId2, packs]);

  // memoize decklist string for the clipboard copy
  const currentDeckList = useMemo(() => {
    if (!pack1 || !pack2) return "";

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack1.data, deckList);
    populateDeckList(pack2.data, deckList);
    return makeDeckListString(deckList);
  }, [pack1, pack2]);

  const mixPacks = useCallback(() => {
    if (packs.length < 2) return; // too few packs

    const randomIndex1 = Math.floor(Math.random() * packs.length);
    let randomIndex2 = Math.floor(Math.random() * packs.length);

    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.length);
    }

    const newPackId1 = packs[randomIndex1].meta.publicId;
    const newPackId2 = packs[randomIndex2].meta.publicId;

    // update local state for instant change
    setLocalPackIds({ packId1: newPackId1, packId2: newPackId2 });
    // synchronize the URL
    navigate({
      search: { packId1: newPackId1, packId2: newPackId2 },
      replace: true,
    });
  }, [packs, navigate]);

  useEffect(() => {
    if (packs.length < 2) return;

    const hasNoPacks = !searchParams.packId1 && !searchParams.packId2;
    const hasOnlyOnePack =
      Boolean(searchParams.packId1) !== Boolean(searchParams.packId2);

    if (hasNoPacks) {
      mixPacks();
      return;
    }

    if (hasOnlyOnePack) {
      const givenId = searchParams.packId1 || searchParams.packId2;
      const givenPackIndex = packs.findIndex(
        (p) => p.meta.publicId === givenId,
      );

      if (givenPackIndex === -1) {
        // the single pack ID from the URL is invalid, so get two new random packs
        // mixPacks();
        return;
      }

      let randomPackIndex = Math.floor(Math.random() * packs.length);
      while (randomPackIndex === givenPackIndex) {
        randomPackIndex = Math.floor(Math.random() * packs.length);
      }
      const randomPack = packs[randomPackIndex];

      const newPackId1 = searchParams.packId1 || randomPack.meta.publicId;
      const newPackId2 = searchParams.packId2 || randomPack.meta.publicId;

      // update local state for instant change
      setLocalPackIds({ packId1: newPackId1, packId2: newPackId2 });
      // synchronize the URL
      navigate({
        search: { packId1: newPackId1, packId2: newPackId2 },
        replace: true,
      });
    }
  }, [searchParams, packs, mixPacks, navigate]);

  return (
    <>
      <h1 className="pb-8 text-3xl">Mixer</h1>
      <div className="mb-8 flex gap-4">
        <Button size="sm" onClick={mixPacks} className="cursor-pointer">
          <Shuffle />
          Randomize Packs
        </Button>
        <CopyButton
          size="sm"
          textToCopy={currentDeckList}
          buttonText="Copy Decklist"
        />
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
