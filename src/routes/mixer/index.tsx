import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { CardDeck, ClipboardCard, PackFile } from "@/lib/types.ts";
import {
  COLORS,
  filterPacks,
  getStorageValue,
  getTwoRandomIndexes,
  isDuplicatePack,
  makeDeckListString,
  populateDeckList,
  SETS,
  stripThemeName,
} from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { type JSX, useCallback, useEffect, useMemo } from "react";
import { InfoIcon, Shuffle } from "lucide-react";
import CopyButton from "@/components/copy-button.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { z } from "zod";
import DuplicatesToggle from "@/components/duplicates-toggle.tsx";
import { useAtom, useSetAtom } from "jotai";
import {
  allowDuplicatesAtom,
  colorFilterAtom,
  currentSidebarCardAtom,
  setFilterAtom,
} from "@/lib/atoms.ts";
import { packsQueryOptions } from "@/lib/queries.ts";
import Sidebar from "@/components/sidebar.tsx";
import CardSpread from "@/components/card-spread.tsx";
import ControlPanel from "@/components/control-panel.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import PackCount from "@/components/pack-count.tsx";

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

      // we need to bypass Jotai and read from localStorage since this is too early in the lifecycle
      const allowDuplicates = getStorageValue("allowDuplicates", true);
      const colorFilter = getStorageValue(
        "colorFilter",
        COLORS.map((color) => color.code),
      );
      const setFilter = getStorageValue(
        "setFilter",
        SETS.map((set) => set.code),
      );

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
        const existingPack2 = packs.find(
          (p) => p.meta.publicId === existingId2,
        );

        // filter out invalid choices
        const validPacks = filteredPacks.filter((p) => {
          if (allowDuplicates) return true;
          return (
            p.meta.publicId !== existingId2 &&
            (!existingPack2 || !isDuplicatePack(p, existingPack2))
          );
        });

        if (validPacks.length > 0) {
          const randomPack =
            validPacks[Math.floor(Math.random() * validPacks.length)];
          redirectId1 = randomPack.meta.publicId;
        }
      } else if (!redirectId2) {
        // only packId2 is missing
        const existingId1 = redirectId1;
        const existingPack1 = packs.find(
          (p) => p.meta.publicId === existingId1,
        );

        // filter out invalid choices
        const validPacks = filteredPacks.filter((p) => {
          if (allowDuplicates) return true;
          return (
            p.meta.publicId !== existingId1 &&
            (!existingPack1 || !isDuplicatePack(p, existingPack1))
          );
        });

        if (validPacks.length > 0) {
          const randomPack =
            validPacks[Math.floor(Math.random() * validPacks.length)];
          redirectId2 = randomPack.meta.publicId;
        }
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
          ? `${stripThemeName(pack1.data.name)} + ${stripThemeName(pack2.data.name)}`
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

    // map to Set filters out duplicates
    const uniqueThemes = new Set(
      filteredPacks.map((pack) => stripThemeName(pack.data.name)),
    );

    return uniqueThemes.size >= 2;
  }, [allowDuplicates, filteredPacks]);

  const comboName = useMemo(() => {
    if (!pack1 || !pack2) return "";
    return `${stripThemeName(pack1.data.name)} + ${stripThemeName(pack2.data.name)}`;
  }, [pack1, pack2]);

  const mixPacks = useCallback(() => {
    if (!hasEnoughPacks) return;
    const [randomIndex1, randomIndex2] = getTwoRandomIndexes(
      filteredPacks,
      allowDuplicates,
    );

    if (randomIndex1 === undefined || randomIndex2 === undefined) return;

    void navigate({
      search: (prev) => ({
        ...prev,
        packId1: filteredPacks[randomIndex1].meta.publicId,
        packId2: filteredPacks[randomIndex2].meta.publicId,
      }),
    });
  }, [hasEnoughPacks, filteredPacks, allowDuplicates, navigate]);

  return (
    <div className="flex">
      <Sidebar showDeckList={false}></Sidebar>
      <div className="flex w-full flex-col gap-4 p-2 sm:p-8 lg:gap-4">
        <ControlPanel
          settings={
            <ControlPanel.Settings>
              <DuplicatesToggle />
            </ControlPanel.Settings>
          }
          actions={
            <ControlPanel.Actions>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button
                    size="sm"
                    onClick={mixPacks}
                    className="flex h-10 w-full cursor-pointer gap-2 sm:w-54"
                    variant="secondary"
                    disabled={!hasEnoughPacks}
                  >
                    <Shuffle />
                    Random Combination
                  </Button>
                  <CopyButton
                    size="sm"
                    variant="default"
                    textToCopy={currentDeckList}
                    buttonText="Copy Combined Decklist"
                    disabled={!currentDeckList}
                    className="flex h-10 w-full gap-2 sm:w-56"
                  />
                  {!hasEnoughPacks && (
                    <Badge variant="destructive">
                      <InfoIcon />
                      <span>Not enough packs to mix!</span>
                    </Badge>
                  )}
                </div>
                <PackCount filteredPacks={filteredPacks} />
              </div>
            </ControlPanel.Actions>
          }
        />
        {!pack1 || !pack2 ? (
          <Alert>
            <AlertTitle>
              <InfoIcon size={20} />
              Invalid packs
            </AlertTitle>
            <AlertDescription>
              A valid combination couldn't be found using these packs. Adjust
              the filters and try the randomize button!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center gap-4 lg:ml-8">
              <img src="/J25.svg" alt="J25 Logo" className="h-12 w-12" />
              <h1 className="text-3xl font-bold">{comboName}</h1>
            </div>
            <div className="grid w-fit grid-cols-1 gap-2 2xl:grid-cols-2">
              <Pack pack={pack1} publicId={pack1.meta.publicId} position={1} />
              <Pack pack={pack2} publicId={pack2.meta.publicId} position={2} />
            </div>
          </>
        )}
        <div className="">
          {pack1 && pack2 && (
            <CardSpread
              packs={[pack1.data, pack2.data]}
              packIds={[pack1.meta.publicId, pack2.meta.publicId]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
