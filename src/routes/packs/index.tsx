import { createFileRoute } from "@tanstack/react-router";
import { filterPacks, handleError } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import { useMemo } from "react";
import { useAtom } from "jotai";
import {
  cardSearchFilterAtom,
  colorFilterAtom,
  currentSidebarDeckListAtom,
  packSearchFilterAtom,
  setFilterAtom,
} from "@/lib/atoms.ts";
import PackListEntry from "@/components/pack-list-entry.tsx";
import Sidebar from "@/components/sidebar.tsx";
import { useAtomValue } from "jotai";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import { CardSearch, PackSearch } from "@/components/search.tsx";

export const Route = createFileRoute("/packs/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(packsQueryOptions),
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
  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const currentSidebarDeckList = useAtomValue(currentSidebarDeckListAtom);
  const [colorFilter] = useAtom(colorFilterAtom);
  const [setFilter] = useAtom(setFilterAtom);
  const [packSearchFilter] = useAtom(packSearchFilterAtom);
  const [cardSearchFilter] = useAtom(cardSearchFilterAtom);

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
        <div className="flex flex-col gap-8 pb-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex gap-4">
              <ColorSelector />
              <SetSelector />
            </div>
            <CategoriesToggle />
          </div>
          <div className="flex flex-col items-baseline gap-4 md:flex-row">
            <PackSearch />
            <CardSearch />
            <span className="min-w-24" data-testid="pack-count">
              {filteredPacks.length}{" "}
              {filteredPacks.length == 1 ? "pack" : "packs"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2" data-testid="pack-list">
          {packList}
        </div>
      </div>
    </div>
  );
}
