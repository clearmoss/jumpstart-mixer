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
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Settings, Shuffle } from "lucide-react";
import CardSpread from "@/components/card-spread.tsx";
import { currentSidebarCardAtom, store } from "@/lib/atoms.ts";
import { stripThemeName } from "@/lib/utils.ts";
import type { CardDeck } from "@/lib/types.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";

export const Route = createFileRoute("/packs/$packId")({
  loader: async ({ context: { queryClient }, params: { packId } }) => {
    const packIndex = await queryClient.ensureQueryData(packIndexQueryOptions);

    const packData = packIndex.find((p) => p.publicId === packId);
    if (!packData) {
      throw notFound();
    }

    const pack = await queryClient.ensureQueryData(packQueryOptions(packId));

    // set currentSidebarCardAtom to the pack's theme card
    store.set(currentSidebarCardAtom, {
      // mock a partial CardDeck as only this data is needed to display a theme card
      name: stripThemeName(pack.data.name),
      setCode: "F" + pack.data.code,
      imageUri: pack.meta.themeCardUri,
    } as CardDeck);

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
  errorComponent: () => <div>Error.</div>,
  notFoundComponent: () => {
    return <p>Pack not found.</p>;
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { packId } = Route.useParams();
  const pack = useSuspenseQuery(packQueryOptions(packId));
  const { data: packs } = useSuspenseQuery(packsQueryOptions);

  const handleRandomClick = () => {
    const otherPacks = packs.filter((p) => p.meta.publicId !== packId);
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
        <Accordion type="single" collapsible className="block border sm:hidden">
          <AccordionItem
            value="item-1"
            className="border-b px-4 last:border-b-0"
          >
            <AccordionTrigger className="flex cursor-pointer items-center gap-2 py-2 hover:no-underline">
              <Settings size={20} className="text-muted-foreground" />
              Filters
            </AccordionTrigger>
            <AccordionContent className="mb-4 flex flex-col gap-8 pt-4">
              <div className="flex items-center justify-center gap-8">
                <ColorSelector />
                <SetSelector />
              </div>
              <CategoriesToggle />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-2 hidden flex-col gap-8 pb-4 sm:mt-0 sm:flex lg:flex-row lg:pb-0">
          <div className="flex gap-4">
            <ColorSelector />
            <SetSelector />
          </div>
          <CategoriesToggle />
        </div>
        <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button
            size="sm"
            className="h-10 w-full cursor-pointer sm:w-54"
            variant="secondary"
            onClick={handleRandomClick}
            disabled={!packs || packs.length <= 1}
          >
            <Shuffle />
            Random Pack
          </Button>
        </div>
        <Pack pack={pack.data} publicId={packId} />
        <div className="pt-4">
          <CardSpread packs={[pack?.data.data]} />
        </div>
      </div>
    </div>
  );
}
