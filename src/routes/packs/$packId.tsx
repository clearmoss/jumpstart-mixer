import { createFileRoute, Link } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { fetchJson, fetchPack } from "@/lib/utils.ts";
import type { PackIndexData } from "@/lib/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";

export const Route = createFileRoute("/packs/$packId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const packIndex: PackIndexData[] = await fetchJson("pack_index.json");
    const pack = packIndex.find((pack) => pack.publicId === params.packId);
    if (pack === undefined) {
      return {
        pack: undefined,
        publicId: undefined,
      };
    }

    const fetchedPack = await fetchPack(pack);
    if (fetchedPack === null) {
      return {
        pack: undefined,
        publicId: undefined,
      };
    }

    return {
      pack: fetchedPack.packFile.data,
      publicId: fetchedPack.packFile.meta.publicId,
    };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const { pack, publicId } = Route.useLoaderData();

  return (
    <div>
      <h1 className="pb-8 text-3xl">Pack</h1>
      {pack === undefined ? (
        <div>Pack data unavailable.</div>
      ) : (
        <>
          <div className="mb-8 flex gap-4">
            <Link
              to="/mixer"
              search={{ packId1: publicId, packId2: undefined }}
              className="[&.active]:font-bold"
            >
              <Button size="sm" className="cursor-pointer">
                <Shuffle />
                Mix This Pack
              </Button>
            </Link>
          </div>
          <Pack pack={pack} publicId={publicId} />
        </>
      )}
    </div>
  );
}
