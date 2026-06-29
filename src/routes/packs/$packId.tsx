import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import {
  packIndexQueryOptions,
  packQueryOptions,
  packsQueryOptions,
} from "@/lib/queries.ts";
import Sidebar from "@/components/sidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import CardSpread from "@/components/card-spread.tsx";
import {
  colorFilterAtom,
  currentSidebarCardAtom,
  setFilterAtom,
} from "@/lib/atoms.ts";
import { filterPacks, stripThemeName } from "@/lib/utils.ts";
import type { CardDeck } from "@/lib/types.ts";
import ControlPanel from "@/components/control-panel.tsx";
import { useEffect, useMemo } from "react";
import { useAtom, useSetAtom } from "jotai";
import PackCount from "@/components/pack-count.tsx";

export const Route = createFileRoute("/packs/$packId")({
  loader: async ({ context: { queryClient }, params: { packId } }) => {
    const packIndex = await queryClient.ensureQueryData(packIndexQueryOptions);

    const packData = packIndex.find((p) => p.publicId === packId);
    if (!packData) {
      throw notFound();
    }

    const pack = await queryClient.ensureQueryData(packQueryOptions(packId));

    return { pack: pack };
  },
  head: ({ loaderData }) => {
    let title = "Pack";
    if (loaderData) {
      title = loaderData.pack
        ? `${loaderData.pack.data.name.replace(/\((\d+)\)/g, "$1")} (${loaderData.pack.data.code})`
        : "Jumpstart Mixer";
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
  notFoundComponent: () => {
    return <p>Pack not found.</p>;
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { packId } = Route.useParams();
  const pack = useSuspenseQuery(packQueryOptions(packId));
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  useEffect(() => {
    if (pack.data) {
      // set currentSidebarCardAtom to the pack's theme card
      setCurrentSidebarCard({
        // mock a partial CardDeck as only this data is needed to display a theme card
        name: stripThemeName(pack.data.data.name),
        setCode: "F" + pack.data.data.code,
        imageUri: pack.data.meta.themeCardUri,
      } as CardDeck);
    }
  }, [pack.data, setCurrentSidebarCard]);

  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const [colorFilter] = useAtom(colorFilterAtom);
  const [setFilter] = useAtom(setFilterAtom);

  const filteredPacks = useMemo(() => {
    return filterPacks(packs, colorFilter, setFilter);
  }, [packs, colorFilter, setFilter]);

  const handleRandomClick = () => {
    const otherPacks = filteredPacks.filter((p) => p.meta.publicId !== packId);
    if (otherPacks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * otherPacks.length);
    const nextPack = otherPacks[randomIndex];

    void navigate({
      to: "/packs/$packId",
      params: { packId: nextPack.meta.publicId },
    });
  };

  return (
    <div className="flex">
      <Sidebar showDeckList={false}></Sidebar>
      <div className="flex w-full flex-col gap-4 p-2 sm:p-8 lg:gap-4">
        <ControlPanel
          settings={<ControlPanel.Settings showCategories={true} />}
          actions={
            <ControlPanel.Actions>
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <Button
                  size="sm"
                  className="flex h-10 w-full cursor-pointer gap-2 sm:w-54"
                  variant="secondary"
                  onClick={handleRandomClick}
                  disabled={!packs || packs.length <= 1}
                >
                  <Shuffle />
                  Random Other Pack
                </Button>
                <PackCount filteredPacks={filteredPacks} />
              </div>
            </ControlPanel.Actions>
          }
        />
        <Pack pack={pack.data} publicId={packId} />
        <div className="">
          <CardSpread packs={[pack?.data.data]} packIds={[packId]} />
        </div>
      </div>
    </div>
  );
}
