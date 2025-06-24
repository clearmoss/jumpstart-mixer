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
import { useCallback, useEffect, useMemo } from "react";
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
  const { packId1, packId2 } = Route.useSearch();
  const { packs } = Route.useLoaderData();

  const { pack1, pack2 } = useMemo(() => {
    const p1 = packs.find((p) => p.meta.publicId === packId1);
    const p2 = packs.find((p) => p.meta.publicId === packId2);
    return { pack1: p1, pack2: p2 };
  }, [packId1, packId2, packs]);

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

    // ensure the random indices are different
    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.length);
    }

    navigate({
      to: "/mixer",
      search: {
        packId1: packs[randomIndex1].meta.publicId,
        packId2: packs[randomIndex2].meta.publicId,
      },
      replace: true,
    }).then();
  }, [packs, navigate]);

  // logic to determine which packs to display based on URL
  useEffect(() => {
    // exit if there are not enough packs to mix
    if (packs.length < 2) return;

    const hasNoPacks = !packId1 && !packId2;
    const hasOnlyOnePack = Boolean(packId1) !== Boolean(packId2);

    // no pack IDs in URL, pick two random packs
    if (hasNoPacks) {
      mixPacks();
      return;
    }

    // exactly one pack ID in URL, so use it
    if (hasOnlyOnePack) {
      const givenId = packId1 || packId2;
      const givenPackIndex = packs.findIndex(
        (p) => p.meta.publicId === givenId,
      );

      // the provided packId is invalid
      if (givenPackIndex === -1) {
        return;
      }

      // find a new random pack, ensuring it is different from the given one
      let randomPackIndex = Math.floor(Math.random() * packs.length);
      while (randomPackIndex === givenPackIndex) {
        randomPackIndex = Math.floor(Math.random() * packs.length);
      }
      const randomPack = packs[randomPackIndex];

      // update URL with both IDs, preserving the one that was originally provided
      navigate({
        to: "/mixer",
        search: {
          packId1: packId1 || randomPack.meta.publicId,
          packId2: packId2 || randomPack.meta.publicId,
        },
        replace: true,
      }).then();
    }
  }, [packId1, packId2, packs, mixPacks, navigate]);

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
      {pack1 !== undefined && pack2 !== undefined && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Pack pack={pack1.data} publicId={pack1.meta.publicId} />
          <Pack pack={pack2.data} publicId={pack2.meta.publicId} />
        </div>
      )}
      {pack1 === undefined ||
        (pack2 === undefined && <div>Pack data unavailable.</div>)}
    </>
  );
}
