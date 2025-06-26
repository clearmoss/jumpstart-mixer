import { createFileRoute } from "@tanstack/react-router";
import Pack from "@/components/pack.tsx";
import { fetchAllPacks, handleError } from "@/lib/utils.ts";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/packs/")({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    const message = handleError(error);
    return <div>Error: {message}</div>;
  },
});

function RouteComponent() {
  const packs = useQuery({
    queryKey: ["packs"],
    queryFn: fetchAllPacks,
    staleTime: Infinity,
  });

  if (packs.isLoading) return <div>Loading packs...</div>;
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
