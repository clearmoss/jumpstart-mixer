import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { filterPacks, handleError } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import { useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  cardSearchFilterAtom,
  colorFilterAtom,
  currentSidebarCardAtom,
  currentSidebarDeckListAtom,
  packSearchFilterAtom,
  setFilterAtom,
  store,
} from "@/lib/atoms.ts";
import PackListEntry from "@/components/pack-list-entry.tsx";
import Sidebar from "@/components/sidebar.tsx";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import { CardSearch, PackSearch } from "@/components/search.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

export const Route = createFileRoute("/packs/")({
  loader: ({ context }) => {
    // clear sidebar state atoms on new page load
    store.set(currentSidebarCardAtom, null);
    store.set(currentSidebarDeckListAtom, { pack: null, publicId: null });
    context.queryClient.ensureQueryData(packsQueryOptions);
  },
  head: () => {
    return {
      meta: [
        {
          title: "Packs",
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

function RouteComponent() {
  const navigate = useNavigate();
  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const currentSidebarDeckList = useAtomValue(currentSidebarDeckListAtom);
  const [colorFilter] = useAtom(colorFilterAtom);
  const [setFilter] = useAtom(setFilterAtom);
  const [packSearchFilter] = useAtom(packSearchFilterAtom);
  const [cardSearchFilter] = useAtom(cardSearchFilterAtom);

  const handleRandomClick = () => {
    if (!packs || packs.length === 0) return;

    const randomIndex = Math.floor(Math.random() * packs.length);
    const selectedPack = packs[randomIndex];

    void navigate({
      to: "/packs/$packId",
      params: { packId: selectedPack.meta.publicId },
    });
  };

  const filteredPacks = useMemo(() => {
    return filterPacks(
      packs,
      colorFilter,
      setFilter,
      packSearchFilter,
      cardSearchFilter,
    );
  }, [packs, colorFilter, setFilter, packSearchFilter, cardSearchFilter]);

  const packList = useMemo(() => {
    return filteredPacks.length > 0 ? (
      filteredPacks.map((pack) => (
        <div key={pack.meta.publicId} data-testid="pack-entry">
          <PackListEntry
            pack={pack}
            publicId={pack.meta.publicId}
            isCurrentlyDisplayed={
              currentSidebarDeckList.publicId === pack.meta.publicId
            }
          />
        </div>
      ))
    ) : (
      <div>No packs found.</div>
    );
  }, [filteredPacks, currentSidebarDeckList.publicId]);

  return (
    <div className="flex">
      <Sidebar></Sidebar>
      <div
        className="flex grow flex-col p-2 sm:p-8"
        data-testid="packs-content"
      >
        <div className="flex flex-col gap-4 pb-8">
          <div className="mt-2 flex flex-col gap-8 sm:mt-0 lg:flex-row">
            <div className="flex gap-4">
              <ColorSelector />
              <SetSelector />
            </div>
            <CategoriesToggle className="hidden lg:flex" />
          </div>
          <div className="flex flex-col flex-wrap items-baseline gap-4 sm:flex-row">
            <Button
              size="sm"
              className="h-10 w-full cursor-pointer sm:w-54"
              variant="secondary"
              onClick={handleRandomClick}
              disabled={!packs || packs.length === 0}
            >
              <Shuffle />
              Random Pack
            </Button>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <PackSearch />
              <CardSearch />
            </div>
            <Badge
              variant="secondary"
              className="h-8 min-w-24 shrink-0 text-sm"
              data-testid="pack-count"
            >
              {filteredPacks.length}{" "}
              {filteredPacks.length == 1 ? "pack" : "packs"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2" data-testid="pack-list">
          {packList}
        </div>
      </div>
    </div>
  );
}
