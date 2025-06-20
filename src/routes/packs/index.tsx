import { createFileRoute } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { fetchAllPacks, handleError } from "@/lib/utils.ts";
import type { PackFile } from "@/lib/types.ts";

export const Route = createFileRoute("/packs/")({
  component: RouteComponent,
  loader: async () => {
    let packs: PackFile[] = [];
    let error: string | undefined;

    try {
      packs = await fetchAllPacks();
    } catch (err: unknown) {
      error = handleError(err);
    }

    return { packs, error };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const { packs } = Route.useLoaderData();

  return (
    <>
      <h1 className="pb-8 text-3xl">Packs</h1>
      <div className="grid grid-cols-2 gap-4">
        {packs.map((pack) => (
          <div key={pack.meta.publicId}>
            <Pack pack={pack.data} publicId={pack.meta.publicId} />
          </div>
        ))}
      </div>
    </>
  );
}
