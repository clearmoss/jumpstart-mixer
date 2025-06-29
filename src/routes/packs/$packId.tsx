import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shuffle } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packIndexQueryOptions, packQueryOptions } from "@/lib/queries.ts";

export const Route = createFileRoute("/packs/$packId")({
  loader: async ({ context: { queryClient }, params: { packId } }) => {
    const packIndex = await queryClient.ensureQueryData(packIndexQueryOptions);

    const packData = packIndex.find((p) => p.publicId === packId);
    if (!packData) {
      throw notFound();
    }

    await queryClient.ensureQueryData(packQueryOptions(packId));
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
