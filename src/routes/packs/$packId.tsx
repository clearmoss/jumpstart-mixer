import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
import { Shuffle } from "lucide-react";

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
  errorComponent: () => <div>Error.</div>,
  notFoundComponent: () => {
    return <p>Pack not found.</p>;
  },
});

function RouteComponent() {
  const { packId } = Route.useParams();
  const pack = useSuspenseQuery(packQueryOptions(packId));
  const { data: packs } = useSuspenseQuery(packsQueryOptions);

  return (
    <div className="flex">
      <Sidebar showDeckList={false}></Sidebar>
      <div className="flex w-full flex-col p-8">
        <div className="flex gap-4 pb-8">
          <ColorSelector />
          <SetSelector />
          <CategoriesToggle />
        </div>
        <div className="mb-8 flex flex-col items-start gap-4 lg:flex-row lg:items-center">
          <Link
            to={"/packs/$packId"}
            params={{ packId: packs[0].meta.publicId }}
            disabled
          >
            <Button size="sm" className="h-10 w-54 cursor-pointer" disabled>
              <Shuffle />
              Random Pack
            </Button>{" "}
          </Link>
        </div>
        <Pack pack={pack.data.data} publicId={packId} />
      </div>
    </div>
  );
}
