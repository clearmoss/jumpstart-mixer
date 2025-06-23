import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { ClipboardCard, PackFile } from "@/lib/types.ts";
import {
  fetchAllPacks,
  handleError,
  makeDeckListString,
  populateDeckList,
} from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { useCallback, useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";

export const Route = createFileRoute("/mixer/")({
  component: RouteComponent,
  loader: async () => {
    let packs: PackFile[] = [];
    let error: string | undefined;

    try {
      packs = await fetchAllPacks();
    } catch (err: unknown) {
      error = handleError(err);
    }

    return { packs, error };
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      packId1: (search.packId1 as string) || undefined,
      packId2: (search.packId2 as string) || undefined,
    };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { packId1, packId2 } = Route.useSearch();
  const { packs } = Route.useLoaderData();
  const [currentDeckList, setCurrentDeckList] = useState("");

  const mixPacks = useCallback(() => {
    if (packs.length < 2) {
      console.warn("Not enough packs to mix.");
      return;
    }

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
      replace: true, // Replace the current history entry
    }).then();
  }, [packs, navigate]);

  // run mixPacks after render if no search params
  useEffect(() => {
    if (!(packId1 || packId2) && packs.length >= 2) {
      mixPacks();
    }
  }, [mixPacks, packId1, packId2, packs]);

  useEffect(() => {
    if (!packId1 || !packId2) return;

    // Find the packs that match the IDs from the search params
    const pack1 = packs.find((p) => p.meta.publicId === packId1);
    const pack2 = packs.find((p) => p.meta.publicId === packId2);

    // TODO: error handling if not found in packs
    if (!pack1 || !pack2) return;

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack1.data, deckList);
    populateDeckList(pack2.data, deckList);
    setCurrentDeckList(makeDeckListString(deckList));
  }, [packId1, packId2, packs]);

  if (!packId1 || !packId2) {
    return <div>Loading...</div>;
  }

  const pack1 = packs.find((p) => p.meta.publicId === packId1);
  const pack2 = packs.find((p) => p.meta.publicId === packId2);

  if (!pack1 || !pack2) {
    return <div>Packs not found</div>;
  }

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
      <div className="grid grid-cols-2 gap-4">
        <Pack pack={pack1?.data} publicId={packId1} />
        <Pack pack={pack2?.data} publicId={packId2} />
      </div>
    </>
  );
}
