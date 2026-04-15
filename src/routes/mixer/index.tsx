import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { CardDeck, ClipboardCard, PackFile } from "@/lib/types.ts";
import {
  filterPacks,
  getTwoRandomIndexes,
  handleError,
  makeDeckListString,
  populateDeckList,
  stripThemeName,
} from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { type JSX, useCallback, useEffect, useMemo } from "react";
import { Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import Loading from "@/components/loading.tsx";
import { z } from "zod";
import DuplicatesToggle from "@/components/duplicates-toggle.tsx";
import { useAtom, useSetAtom } from "jotai";
import {
  allowDuplicatesAtom,
  colorFilterAtom,
  currentSidebarCardAtom,
  setFilterAtom,
  store,
} from "@/lib/atoms.ts";
import { packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import Sidebar from "@/components/sidebar.tsx";
import CardSpread from "@/components/card-spread.tsx";

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
      // one or both pack search params are missing
      const packs =
        await context.queryClient.ensureQueryData(packsQueryOptions);
      let redirectId1 = search.packId1;
      let redirectId2 = search.packId2;

      // use store to access Jotai state outside of React's lifecycle
      const allowDuplicates = store.get(allowDuplicatesAtom);
      const colorFilter = store.get(colorFilterAtom);
      const setFilter = store.get(setFilterAtom);

      const filteredPacks = filterPacks(packs, colorFilter, setFilter, "", "");

      if (filteredPacks.length === 0) {
        return;
      }

      if (!allowDuplicates && filteredPacks.length < 2) {
        return;
      }

      if (!redirectId1 && !redirectId2) {
        // both pack IDs are missing
        const indexes = getTwoRandomIndexes(filteredPacks, allowDuplicates);
        if (indexes.length < 2) return;
        redirectId1 = filteredPacks[indexes[0]].meta.publicId;
        redirectId2 = filteredPacks[indexes[1]].meta.publicId;
      } else if (!redirectId1) {
        // only packId1 is missing
        const existingId2 = redirectId2;
        let newIndex1;

        do {
          newIndex1 = Math.floor(Math.random() * filteredPacks.length);
        } while (
          !allowDuplicates &&
          filteredPacks[newIndex1].meta.publicId === existingId2
        );
        redirectId1 = filteredPacks[newIndex1].meta.publicId;
      } else if (!redirectId2) {
        // only packId2 is missing
        const existingId1 = redirectId1;
        let newIndex2;

        do {
          newIndex2 = Math.floor(Math.random() * filteredPacks.length);
        } while (
          !allowDuplicates &&
          filteredPacks[newIndex2].meta.publicId === existingId1
        );
        redirectId2 = filteredPacks[newIndex2].meta.publicId;
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
  loader: async ({ context, deps }) => {
    const packs = await context.queryClient.ensureQueryData(packsQueryOptions);
    return {
      packId1: deps.packId1,
      packId2: deps.packId2,
      packs: packs,
    };
  },
  head: ({ loaderData }) => {
    let title = "Mixer";
    if (loaderData) {
      const pack1 = loaderData.packs.find(
        (p: PackFile) => p.meta.publicId === loaderData.packId1,
      );
      const pack2 = loaderData.packs.find(
        (p: PackFile) => p.meta.publicId === loaderData.packId2,
      );
      title =
        pack1 && pack2
          ? `${pack1.data.name.replace(/\((\d+)\)/g, "$1")} + ${pack2.data.name.replace(/\((\d+)\)/g, "$1")}`
          : "Mixer";
    }

    return {
      meta: [
        {
          title: title,
        },
      ],
    };
  },
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
  const [setFilter] = useAtom(setFilterAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  const { pack1, pack2 } = useMemo(() => {
    const p1 = packs.find((p) => p.meta.publicId === packId1);
    const p2 = packs.find((p) => p.meta.publicId === packId2);
    return { pack1: p1, pack2: p2 };
  }, [packId1, packId2, packs]);

  useEffect(() => {
    if (pack1) {
      // set currentSidebarCardAtom to the first pack's theme card
      setCurrentSidebarCard({
        // mock a partial CardDeck as only this data is needed to display a theme card
        name: stripThemeName(pack1.data.name),
        setCode: "F" + pack1.data.code,
        imageUri: pack1.meta.themeCardUri,
      } as CardDeck);
    }
  }, [pack1, setCurrentSidebarCard]);

  const currentDeckList = useMemo(() => {
    if (!pack1 || !pack2) return "";

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack1.data, deckList);
    populateDeckList(pack2.data, deckList);
    return makeDeckListString(deckList);
  }, [pack1, pack2]);

  const filteredPacks = useMemo(() => {
    return filterPacks(packs, colorFilter, setFilter, "", "");
  }, [packs, colorFilter, setFilter]);

  const hasEnoughPacks = useMemo(() => {
    if (allowDuplicates) {
      return filteredPacks.length >= 1;
    }
    return filteredPacks.length >= 2;
  }, [allowDuplicates, filteredPacks]);

  const mixPacks = useCallback(() => {
    const [randomIndex1, randomIndex2] = getTwoRandomIndexes(
      filteredPacks,
      allowDuplicates,
    );

    if (randomIndex1 === undefined || randomIndex2 === undefined) return;

    void navigate({
      search: {
        packId1: filteredPacks[randomIndex1].meta.publicId,
        packId2: filteredPacks[randomIndex2].meta.publicId,
      },
      // replace: true,
    });
  }, [filteredPacks, allowDuplicates, navigate]);

  return (
    <div className="flex">
      <Sidebar showDeckList={false}></Sidebar>
      <div className="flex w-full flex-col p-2 sm:p-8">
        <div className="mt-2 mb-8 flex flex-col items-start sm:mt-0">
          <div className="mb-8 flex flex-col items-start gap-8 xl:mb-4 xl:flex-row xl:items-center">
            <div className="flex gap-4">
              <ColorSelector />
              <SetSelector />
            </div>
            <CategoriesToggle />
            <DuplicatesToggle />
          </div>
          <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={mixPacks}
              className="h-10 w-full cursor-pointer sm:w-54"
              variant="secondary"
              disabled={filteredPacks.length < (allowDuplicates ? 1 : 2)}
            >
              <Shuffle />
              Randomize ({filteredPacks.length}{" "}
              {filteredPacks.length == 1 ? "Pack" : "Packs"})
            </Button>
            <CopyButton
              size="sm"
              variant="default"
              textToCopy={currentDeckList}
              buttonText="Copy Combined Decklist"
              disabled={!currentDeckList}
              className="h-10 w-full sm:w-56"
            />
          </div>
        </div>
        {!hasEnoughPacks ? (
          <div>Not enough packs to mix.</div>
        ) : pack1 && pack2 ? (
          <div className="grid w-fit grid-cols-1 gap-4 2xl:grid-cols-2">
            <Pack pack={pack1} publicId={pack1.meta.publicId} position={1} />
            <Pack pack={pack2} publicId={pack2.meta.publicId} position={2} />
          </div>
        ) : (
          <div>
            {!packId1 && !packId2 ? (
              <div>Not enough packs to mix.</div>
            ) : (
              "Pack(s) not found. Try the randomize button!"
            )}
          </div>
        )}
        <div className="pt-8">
          {pack1 && pack2 && <CardSpread packs={[pack1.data, pack2.data]} />}
        </div>
      </div>
    </div>
  );
}
