import { describe, expect, it } from "vitest";

import type { PackIndex, SetMetadata } from "@/lib/types.ts";

import { getSelectedSetCodes, getSetCodesFromPackIndex, sortSetMetadata } from "@/lib/utils.ts";

const sets: SetMetadata[] = [
  { code: "J26", name: "Jumpstart 2026", releaseDate: "2026-11-13" },
  { code: "J26B", name: "Jumpstart 2026 B", releaseDate: "2026-11-13" },
  { code: "J25", name: "Foundations Jumpstart", releaseDate: "2024-11-15" },
  { code: "J22", name: "Jumpstart 2022", releaseDate: "2022-11-18" },
  { code: "JMP", name: "Jumpstart", releaseDate: "2020-07-17" },
];

describe("set metadata", () => {
  it("sorts sets by release date and then code", () => {
    expect(sortSetMetadata(sets).map((set) => set.code)).toEqual([
      "JMP",
      "J22",
      "J25",
      "J26",
      "J26B",
    ]);
  });

  it("defaults to the legacy sets without selecting newly available sets", () => {
    expect(getSelectedSetCodes(null, sets)).toEqual(["JMP", "J22", "J25"]);
  });

  it("preserves a saved selection and leaves new sets unchecked", () => {
    expect(getSelectedSetCodes(["JMP", "J25"], sets)).toEqual(["JMP", "J25"]);
  });

  it("keeps a new set after the user explicitly selects it", () => {
    expect(getSelectedSetCodes(["JMP", "J26"], sets)).toEqual(["JMP", "J26"]);
  });

  it("reads set codes from the pack index set list", () => {
    const index: PackIndex = {
      sets: ["JMP", "J22", "J25"],
      packs: [{ publicId: "one", url: "packs/J25/Test.json" }],
    };

    expect(getSetCodesFromPackIndex(index)).toEqual(["JMP", "J22", "J25"]);
  });
});
