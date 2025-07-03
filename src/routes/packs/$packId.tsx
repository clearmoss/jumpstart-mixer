import { createFileRoute, notFound } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packIndexQueryOptions, packQueryOptions } from "@/lib/queries.ts";
import Sidebar from "@/components/sidebar.tsx";

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

  return (
    <div className="flex">
      <Sidebar></Sidebar>
      <div className="flex grow flex-col p-8">
        <Pack pack={pack.data.data} publicId={packId} />
      </div>
    </div>
  );
}
