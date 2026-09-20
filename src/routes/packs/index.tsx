import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { InfoIcon, Shuffle } from "lucide-react";
import { useEffect, useMemo } from "react";

import ControlPanel from "@/components/control-panel.tsx";
import Loading from "@/components/loading.tsx";
import PackCount from "@/components/pack-count.tsx";
import PackListEntry from "@/components/pack-list-entry.tsx";
import { CardSearch, PackSearch } from "@/components/search.tsx";
import Sidebar from "@/components/sidebar.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useFilteredPacks } from "@/hooks/use-filtered-packs.ts";
import { currentSidebarCardAtom, currentSidebarDeckListAtom } from "@/lib/atoms.ts";
import { packsQueryOptions } from "@/lib/queries.ts";

export const Route = createFileRoute("/packs/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(packsQueryOptions).then();
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
  const filteredPacks = useFilteredPacks({ useSearch: true });
  const setCurrentSidebarDeckList = useSetAtom(currentSidebarDeckListAtom);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  useEffect(() => {
    // clear sidebar state atoms on page load
    setCurrentSidebarCard(null);
    setCurrentSidebarDeckList({ pack: null, publicId: null });
  }, [setCurrentSidebarCard, setCurrentSidebarDeckList]);

  const packList = useMemo(() => {
    return filteredPacks.map((pack) => (
      <div key={pack.meta.publicId} className="mb-2 break-inside-avoid" data-testid="pack-entry">
        <PackListEntry pack={pack} publicId={pack.meta.publicId} />
      </div>
    ));
  }, [filteredPacks]);

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
      <div className="flex grow flex-col p-2 sm:p-8" data-testid="packs-content">
        <div className="flex flex-col gap-4 pb-4">
          <ControlPanel
            settings={<ControlPanel.Settings />}
            settingsHeader={<PackCount filteredPacks={filteredPacks} />}
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
                </div>
              </ControlPanel.Actions>
            }
          />
        </div>
        {filteredPacks.length > 0 ? (
          <div className="columns-xl gap-2" data-testid="pack-list">
            {packList}
          </div>
        ) : (
          <Alert>
            <AlertTitle>
              <InfoIcon size={20} />
              No packs found
            </AlertTitle>
            <AlertDescription>
              There aren&apos;t any packs that match the current filters.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
