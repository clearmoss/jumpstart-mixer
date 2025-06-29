import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { ClipboardCard } from "@/lib/types.ts";
import {
  determinePackColors,
  handleError,
  makeDeckListString,
  populateDeckList,
} from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { type JSX, useCallback, useMemo } from "react";
import { Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import Loading from "@/components/loading.tsx";
import { z } from "zod";
import DuplicatesToggle from "@/components/duplicates-toggle.tsx";
import { useAtom } from "jotai/index";
import { allowDuplicatesAtom, colorFilterAtom } from "@/lib/atoms.ts";
import { packIndexQueryOptions, packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";

const mixerSearchSchema = z.object({
  packId1: z.string().optional(),
  packId2: z.string().optional(),
});

export const Route = createFileRoute("/mixer/")({
  validateSearch: (search) => mixerSearchSchema.parse(search),
  loaderDeps: ({ search: { packId1, packId2 } }) => ({
    packId1,
    packId2,
  }),
  beforeLoad: async ({ search, context }) => {
    if (!search.packId1 || !search.packId2) {
      // pack search param is missing
      const packIndex = await context.queryClient.ensureQueryData(
        packIndexQueryOptions,
      );
      let redirectId1 = search.packId1;
      let redirectId2 = search.packId2;

      if (!search.packId1) {
        const randomIndex1 = Math.floor(Math.random() * packIndex.length);
        redirectId1 = packIndex[randomIndex1].publicId;
      }
      if (!search.packId2) {
        const randomIndex2 = Math.floor(Math.random() * packIndex.length);
        redirectId2 = packIndex[randomIndex2].publicId;
      }

      throw redirect({
        search: {
          packId1: redirectId1,
          packId2: redirectId2,
        },
        replace: true,
      });
    }
  },
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
  const [allowDuplicates] = useAtom(allowDuplicatesAtom);
  const [colorFilter] = useAtom(colorFilterAtom);

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

  const filteredPacks = useMemo(() => {
    return packs.filter((p) => {
      return colorFilter.includes(determinePackColors(p.data)[0].color);
    });
  }, [packs, colorFilter]);

  const mixPacks = useCallback(() => {
    if (!filteredPacks || filteredPacks.length < 2) return;

    const randomIndex1 = Math.floor(Math.random() * filteredPacks.length);
    let randomIndex2 = Math.floor(Math.random() * filteredPacks.length);

    if (!allowDuplicates) {
      while (randomIndex1 === randomIndex2) {
        randomIndex2 = Math.floor(Math.random() * filteredPacks.length);
      }
    }

    const redirectId1 = filteredPacks[randomIndex1].meta.publicId;
    const redirectId2 = filteredPacks[randomIndex2].meta.publicId;

    void navigate({
      search: {
        packId1: redirectId1,
        packId2: redirectId2,
      },
      replace: true,
    });
  }, [filteredPacks, allowDuplicates, navigate]);

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
        <DuplicatesToggle />
        <ColorSelector />
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
