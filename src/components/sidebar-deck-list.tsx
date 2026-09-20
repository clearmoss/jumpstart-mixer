import { useAtomValue } from "jotai";

import DeckList from "@/components/deck-list.tsx";
import { currentSidebarDeckListAtom } from "@/lib/atoms.ts";

export function SidebarDeckList() {
  const { pack } = useAtomValue(currentSidebarDeckListAtom);

  return (
    <div className="w-100">
      <DeckList pack={pack ? pack : undefined} />
    </div>
  );
}
