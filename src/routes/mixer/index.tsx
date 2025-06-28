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
import { type JSX, useCallback, useEffect, useMemo } from "react";
import { Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import Loading from "@/components/loading.tsx";
import { z } from "zod";

const packsQueryOptions = queryOptions({
  queryKey: ["packs"],
  queryFn: () => fetchAllPacks(),
  staleTime: Infinity,
});

const mixerSearchSchema = z.object({
  packId1: z.string().optional(),
  packId2: z.string().optional(),
});

export const Route = createFileRoute("/mixer/")({
  validateSearch: (search) => mixerSearchSchema.parse(search),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(packsQueryOptions),
  component: RouteComponent,
  pendingComponent: () => <Loading />,
  errorComponent: ({ error }) => {
    const message = handleError(error);
    return <div>Error: {message}</div>;
  },
});

function RouteComponent(): JSX.Element {
  const navigate = useNavigate({ from: Route.fullPath });
  const { packId1, packId2 } = Route.useSearch();
  const { data: packs } = useSuspenseQuery(packsQueryOptions);

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
    if (!packs || packs.length < 2) return;

    const randomIndex1 = Math.floor(Math.random() * packs.length);
    let randomIndex2 = Math.floor(Math.random() * packs.length);

    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.length);
    }

    void navigate({
      search: {
        packId1: packs[randomIndex1].meta.publicId,
        packId2: packs[randomIndex2].meta.publicId,
      },
      replace: true,
    });
  }, [packs, navigate]);

  useEffect(() => {
    if (!packs || packs.length < 2) return;

    const hasNoPacks = !packId1 && !packId2;
    const hasOnlyOnePack = Boolean(packId1) !== Boolean(packId2);

    if (hasNoPacks) {
      mixPacks();
    } else if (hasOnlyOnePack) {
      const givenId = packId1 || packId2;
      const givenPack = packs.find((p) => p.meta.publicId === givenId);

      if (!givenPack) {
        // invalid pack id
        return;
      }

      let randomPack: PackFile;
      do {
        randomPack = packs[Math.floor(Math.random() * packs.length)];
      } while (randomPack.meta.publicId === givenId);

      void navigate({
        search: {
          packId1: packId1 || randomPack.meta.publicId,
          packId2: packId2 || randomPack.meta.publicId,
        },
        replace: true,
      });
    }
  }, [packId1, packId2, packs, mixPacks, navigate]);

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
          disabled={!currentDeckList}
        />
        <CategoriesToggle />
      </div>
      {pack1 && pack2 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Pack pack={pack1.data} publicId={pack1.meta.publicId} />
          <Pack pack={pack2.data} publicId={pack2.meta.publicId} />
        </div>
      ) : (
        <div>
          {!packId1 && !packId2 ? (
            <Loading />
          ) : (
            "Pack(s) not found. Try the randomize button!"
          )}
        </div>
      )}
    </>
  );
}
