import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  packQueryOptions,
  packIndexQueryOptions,
  packsQueryOptions,
  setMetadataQueryOptions,
} from "@/lib/queries.ts";
import { filterPacks, getSelectedSetCodes } from "@/lib/utils.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("pack data query versioning", () => {
  it("loads the current pack index, packs, and set metadata instead of legacy cached values", async () => {
    const currentIndex = {
      sets: ["J26"],
      packs: [
        {
          publicId: "future-set-pack",
          url: "packs/J26/Example/Example_J26.json",
        },
      ],
    };
    const currentPack = {
      meta: { publicId: "future-set-pack" },
      data: {
        code: "J26",
        name: "Example 1",
        mainBoard: [{ name: "Example Card", colorIdentity: ["W"], count: 1 }],
      },
    };
    const currentSet = {
      code: "J26",
      name: "Jumpstart 2026",
      releaseDate: "2026-11-13",
    };

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const responseData = {
        "/pack_index.json": currentIndex,
        "/packs/J26/Example/Example_J26.json": currentPack,
        "/packs/J26/set.json": currentSet,
      }[url];

      if (!responseData) {
        throw new Error(`Unexpected fetch: ${url}`);
      }

      return new Response(JSON.stringify(responseData), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient();
    queryClient.setQueryData(["packIndex"], [{ publicId: "stale", url: "packs/J25/stale.json" }]);
    queryClient.setQueryData(["packs"], [{ meta: { publicId: "stale" } }]);
    queryClient.setQueryData(
      ["setMetadata"],
      [{ code: "J25", name: "Stale Set", releaseDate: "2024-11-15" }]
    );
    queryClient.setQueryData(["pack", "future-set-pack"], {
      meta: { publicId: "future-set-pack" },
      data: { code: "J25", name: "Stale Pack", mainBoard: [] },
    });

    const [index, packs, sets, pack] = await Promise.all([
      queryClient.query(packIndexQueryOptions),
      queryClient.query(packsQueryOptions),
      queryClient.query(setMetadataQueryOptions),
      queryClient.query(packQueryOptions("future-set-pack")),
    ]);

    expect(index).toEqual(currentIndex);
    expect(packs.map(({ data }) => data.code)).toEqual(["J26"]);
    expect(sets.map(({ code }) => code)).toEqual(["J26"]);
    const selectedSets = getSelectedSetCodes(["J26"], sets);
    expect(filterPacks(packs, ["W"], selectedSets)).toHaveLength(1);
    expect(pack.data.code).toBe("J26");
    expect(fetchMock).toHaveBeenCalledWith("/pack_index.json");
    expect(fetchMock).toHaveBeenCalledWith("/packs/J26/Example/Example_J26.json");
    expect(fetchMock).toHaveBeenCalledWith("/packs/J26/set.json");

    queryClient.clear();
  });
});
