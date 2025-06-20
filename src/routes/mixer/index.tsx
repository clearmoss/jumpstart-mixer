import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { PackFile } from "@/lib/types.ts";
import { fetchAllPacks, handleError } from "@/lib/utils.ts";
import { useState } from "react";
import Pack from "@/components/pack.tsx";

export const Route = createFileRoute("/mixer/")({
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
  const [mixedPacks, setMixedPacks] = useState<PackFile[]>([
    packs[0],
    packs[1],
  ]);

  const mixPacks = () => {
    if (packs.length < 2) {
      console.warn("Not enough packs to mix.");
      return;
    }

    const randomIndex1 = Math.floor(Math.random() * packs.length);
    let randomIndex2 = Math.floor(Math.random() * packs.length);

    // ensure the random indices are different
    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.length);
    }

    setMixedPacks([packs[randomIndex1], packs[randomIndex2]]);
  };

  return (
    <>
      <h1 className="pb-8 text-3xl">Mixer</h1>
      <Button onClick={mixPacks} className="mb-8">
        Mix
      </Button>
      <div className="grid grid-cols-2 gap-4">
        <Pack
          pack={mixedPacks[0].data}
          publicId={mixedPacks[0].meta.publicId}
        />
        <Pack
          pack={mixedPacks[1].data}
          publicId={mixedPacks[1].meta.publicId}
        />
      </div>
    </>
  );
}
