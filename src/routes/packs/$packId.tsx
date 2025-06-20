import { createFileRoute } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { fetchJson, fetchPack } from "@/lib/utils.ts";
import type { PackIndexData } from "@/lib/types.ts";

export const Route = createFileRoute("/packs/$packId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const packIndex: PackIndexData[] = await fetchJson("pack_index.json");
    const pack = packIndex.find((pack) => pack.publicId === params.packId);
    if (pack === undefined) {
      return {
        pack: null,
        publicId: null,
      };
    }

    const fetchedPack = await fetchPack(pack);
    if (fetchedPack === null) {
      return {
        pack: null,
        publicId: null,
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
      <Pack pack={pack} publicId={publicId} />
    </div>
  );
}
