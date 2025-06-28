import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { fetchJson } from "@/lib/utils.ts";
import type { PackFile, PackIndexData } from "@/lib/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";

const packIndexQueryOptions = queryOptions({
  queryKey: ["packIndex"],
  queryFn: () => fetchJson<PackIndexData[]>("pack_index.json"),
  staleTime: Infinity,
});

const packQueryOptions = (packUrl: string) =>
  queryOptions({
    queryKey: ["pack", packUrl],
    queryFn: () => fetchJson<PackFile>(packUrl),
    staleTime: Infinity,
  });

export const Route = createFileRoute("/packs/$packId")({
  loader: async ({ context: { queryClient }, params: { packId } }) => {
    const packIndex = await queryClient.ensureQueryData(packIndexQueryOptions);

    const packData = packIndex.find((p) => p.publicId === packId);
    if (!packData) {
      throw notFound();
    }

    return queryClient.ensureQueryData(packQueryOptions(packData.url));
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

  const packIndex = useSuspenseQuery(packIndexQueryOptions);
  const packData = packIndex.data.find((p) => p.publicId === packId);

  if (!packData) {
    throw new Error(`Pack with ID ${packId} not found`);
  }

  const pack = useSuspenseQuery(packQueryOptions(packData.url));

  return (
    <>
      <h1 className="pb-8 text-3xl">Pack</h1>
      <div className="mb-8 flex gap-4">
        <Link to="/mixer" search={{ packId1: packId, packId2: undefined }}>
          <Button size="sm" className="cursor-pointer">
            <Shuffle />
            Mix This Pack
          </Button>
        </Link>
      </div>
      <Pack pack={pack.data.data} publicId={packId} />
    </>
  );
}
