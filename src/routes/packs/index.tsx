import { createFileRoute } from "@tanstack/react-router";
import { filterPacks, handleError } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import Loading from "@/components/loading.tsx";
import { packsQueryOptions } from "@/lib/queries.ts";
import ColorSelector from "@/components/color-selector.tsx";
import SetSelector from "@/components/set-selector.tsx";
import { useMemo } from "react";
import { useAtom } from "jotai/index";
import { colorFilterAtom, setFilterAtom } from "@/lib/atoms.ts";
import PackListEntry from "@/components/pack-list-entry.tsx";

export const Route = createFileRoute("/packs/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(packsQueryOptions),
  head: () => {
    return {
      meta: [
        {
          title: "Packs",
        },
      ],
    };
  },
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
    const filteredPacks = filterPacks(packs, colorFilter, setFilter);
    return filteredPacks.length > 0 ? (
      filteredPacks.map((pack) => (
        <div key={pack.meta.publicId}>
          <PackListEntry pack={pack.data} publicId={pack.meta.publicId} />
        </div>
      ))
    ) : (
      <div>No packs found.</div>
    );
  }, [packs, colorFilter, setFilter]);

  return (
    <>
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <ColorSelector />
        <SetSelector />
      </div>
      <div className="grid grid-cols-1 gap-2">{filteredPacks}</div>
    </>
  );
}
