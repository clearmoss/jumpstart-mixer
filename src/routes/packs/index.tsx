import { createFileRoute, Link } from "@tanstack/react-router";
import type { Deck, Meta } from "@/lib/AllMTGJSONTypes.ts";

interface SinglePackFile {
  meta: Meta;
  data: Deck;
}

export const Route = createFileRoute("/packs/")({
  component: RouteComponent,
  loader: async () => {
    let packs: SinglePackFile[] = [];
    let error: string | undefined = undefined;

    interface packIndexData {
      publicId: string;
      url: string;
    }

    try {
      // helper function to safely fetch JSON and return it as an object
      const fetchJson = async (filePath: string) => {
        const response = await fetch(`${filePath}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${filePath}: ${response.statusText}`,
          );
        }
        return response.json();
      };

      // the pack index is generated at build and maps every pack in the public dir
      const packIndex: packIndexData[] = await fetchJson("pack_index.json");

      // fetch each pack individually using the url from the pack index
      const packPromises = packIndex.map(async (pack) => {
        try {
          const packFile: SinglePackFile = await fetchJson(pack.url);
          return { packFile };
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.warn(
              `Could not load or parse deck file ${pack}:`,
              err.message,
            );
          } else {
            error = "An unknown error occurred while parsing data.";
            console.error("Caught an unknown error:", err);
          }
          return null; // Return null for failed fetches
        }
      });
      const fetchedPacks = (await Promise.all(packPromises)).filter(
        Boolean,
      ) as { packFile: SinglePackFile }[];

      packs = fetchedPacks.map((item) => item.packFile); // Extract SinglePackFile from { packFile: SinglePackFile }

      // TODO: error handle any null fetches by pruning
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
        console.error("Caught an Error object:", err.message);
        console.error("Error name:", err.name);
        if (err.stack) {
          console.error("Error stack:", err.stack);
        }
      } else {
        error = "An unknown error occurred while loading data.";
        console.error("Caught an unknown error:", err);
      }
    }

    return { packs, error };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const { packs } = Route.useLoaderData();

  return (
    <div>
      {packs.map((pack) => (
        <div key={pack.meta.publicId}>
          <Link
            to="/packs/$packId"
            params={{
              packId: pack.meta.publicId,
            }}
          >
            {pack.data.code} -{pack.data.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
