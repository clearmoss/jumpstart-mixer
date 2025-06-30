import { createFileRoute } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { filterPacks, handleError } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import CategoriesToggle from "@/components/categories-toggle.tsx";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import { useMemo } from "react";
import { useAtom } from "jotai/index";
import { colorFilterAtom, setFilterAtom } from "@/lib/atoms.ts";

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
  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const [colorFilter] = useAtom(colorFilterAtom);
  const [setFilter] = useAtom(setFilterAtom);

  const filteredPacks = useMemo(() => {
    return filterPacks(packs, colorFilter, setFilter);
  }, [packs, colorFilter, setFilter]);

  return (
    <>
      <h1 className="pb-8 text-3xl">Packs</h1>
      <div className="mb-8 flex items-center gap-4">
        <CategoriesToggle />
        <ColorSelector />
        <SetSelector />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredPacks.length > 0 ? (
          filteredPacks.map((pack) => (
            <div key={pack.meta.publicId}>
              <Pack pack={pack.data} publicId={pack.meta.publicId} />
            </div>
          ))
        ) : (
          <div>No packs found.</div>
        )}
      </div>
    </>
  );
}
