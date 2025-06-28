import { atomWithStorage } from "jotai/utils";

export const showCategoriesAtom = atomWithStorage("showCategories", true);
export const allowDuplicatesAtom = atomWithStorage("allowDuplicates", true);
