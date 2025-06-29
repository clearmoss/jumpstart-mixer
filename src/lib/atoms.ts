import { atomWithStorage } from "jotai/utils";
import { COLORS } from "@/lib/utils.ts";

export const showCategoriesAtom = atomWithStorage("showCategories", true);
export const allowDuplicatesAtom = atomWithStorage("allowDuplicates", true);
export const colorFilterAtom = atomWithStorage(
  "colorFilter",
  COLORS.map((color) => color.code),
);
