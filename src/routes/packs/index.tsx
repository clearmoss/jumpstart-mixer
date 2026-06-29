import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { filterPacks } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";
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
import { CardSearch, PackSearch } from "@/components/search.tsx";
import { Button } from "@/components/ui/button.tsx";
import { InfoIcon, Shuffle } from "lucide-react";
import ControlPanel from "@/components/control-panel.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import PackCount from "@/components/pack-count.tsx";

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
});

function RouteComponent() {
  const navigate = useNavigate();
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
      <Alert>
        <AlertTitle>
          <InfoIcon size={20} />
          No packs found
        </AlertTitle>
        <AlertDescription>
          There aren't any packs that match the current filters.
        </AlertDescription>
      </Alert>
    );
  }, [filteredPacks, currentSidebarDeckList.publicId]);

  const handleRandomClick = () => {
    if (!filteredPacks || filteredPacks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * filteredPacks.length);
    const selectedPack = filteredPacks[randomIndex];

    void navigate({
      to: "/packs/$packId",
      params: { packId: selectedPack.meta.publicId },
    });
  };

  return (
    <div className="flex">
      <Sidebar></Sidebar>
      <div
        className="flex grow flex-col p-2 sm:p-8"
        data-testid="packs-content"
      >
        <div className="flex flex-col gap-4 pb-4">
          <ControlPanel
            settings={<ControlPanel.Settings />}
            actions={
              <ControlPanel.Actions>
                <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      size="sm"
                      className="flex h-10 w-full cursor-pointer gap-2 sm:w-54"
                      variant="secondary"
                      onClick={handleRandomClick}
                      disabled={!filteredPacks || filteredPacks.length === 0}
                    >
                      <Shuffle />
                      Random Pack
                    </Button>
                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap">
                      <PackSearch />
                      <CardSearch />
                    </div>
                  </div>
                  <PackCount filteredPacks={filteredPacks} />
                </div>
              </ControlPanel.Actions>
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-2" data-testid="pack-list">
          {packList}
        </div>
      </div>
    </div>
  );
}
