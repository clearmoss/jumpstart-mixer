import { createFileRoute } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { handleError } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";

export const Route = createFileRoute("/packs/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(packsQueryOptions),
  component: RouteComponent,
  pendingComponent: () => <Loading />,
  errorComponent: ({ error }) => {
    const message = handleError(error);
    return <div>Error: {message}</div>;
  },
});

function RouteComponent() {
  const packs = useSuspenseQuery(packsQueryOptions);

  if (packs.isError || packs.data === undefined) return <div>Error</div>;

  if (packs.data.length === 0) {
    return (
      <>
        <h1 className="pb-8 text-3xl">Packs</h1>
        <div>No packs found.</div>
      </>
    );
  }

  return (
    <>
      <h1 className="pb-8 text-3xl">Packs</h1>
      <div className="pb-8">
        <CategoriesToggle />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {packs.data.map((pack) => (
          <div key={pack.meta.publicId}>
            <Pack pack={pack.data} publicId={pack.meta.publicId} />
          </div>
        ))}
      </div>
    </>
  );
}
