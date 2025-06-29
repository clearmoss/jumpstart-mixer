import { atomWithStorage } from "jotai/utils";
import { COLORS, SETS } from "@/lib/utils.ts";
import { createStore } from "jotai";

export const store = createStore();

export const showCategoriesAtom = atomWithStorage("showCategories", true);
export const allowDuplicatesAtom = atomWithStorage("allowDuplicates", true);
export const colorFilterAtom = atomWithStorage(
  "colorFilter",
  COLORS.map((color) => color.code),
);
export const setFilterAtom = atomWithStorage(
  "setFilter",
  SETS.map((set) => set.code),
);
