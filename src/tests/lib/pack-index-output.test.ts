import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import type { PackIndex, SetMetadata } from "@/lib/types.ts";

describe("generated pack index", () => {
  it("orders packs by set release date and stable set/path ties", async () => {
    const indexPath = path.join(process.cwd(), "public", "pack_index.json");
    const index = JSON.parse(await readFile(indexPath, "utf8")) as PackIndex;
    const { packs } = index;
    const codes = [...new Set(packs.map((entry) => entry.url.split("/")[1]))];
    expect(index.sets).toEqual(codes);
    const metadataEntries = await Promise.all(
      codes.map(async (code) => {
        const metadataPath = path.join(process.cwd(), "public", "packs", code, "set.json");
        return [code, JSON.parse(await readFile(metadataPath, "utf8")) as SetMetadata] as const;
      })
    );
    const metadataByCode = new Map(metadataEntries);

    for (const entry of packs) {
      expect(entry.url).not.toMatch(/\/set\.json$/u);
    }

    for (let indexInList = 1; indexInList < packs.length; indexInList++) {
      const previous = packs[indexInList - 1];
      const current = packs[indexInList];
      const previousCode = previous.url.split("/")[1];
      const currentCode = current.url.split("/")[1];
      const previousSet = metadataByCode.get(previousCode);
      const currentSet = metadataByCode.get(currentCode);

      expect(previousSet).toBeDefined();
      expect(currentSet).toBeDefined();
      expect(
        previousSet!.releaseDate.localeCompare(currentSet!.releaseDate) ||
          previousSet!.code.localeCompare(currentSet!.code) ||
          previous.url.localeCompare(current.url)
      ).toBeLessThanOrEqual(0);
    }
  });
});
