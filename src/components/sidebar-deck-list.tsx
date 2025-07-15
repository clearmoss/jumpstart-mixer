import { useAtomValue } from "jotai";
import { currentSidebarDeckListAtom } from "@/lib/atoms.ts";
import DeckList from "@/components/deck-list.tsx";

export function SidebarDeckList() {
  const { pack } = useAtomValue(currentSidebarDeckListAtom);

  return (
    <div className="w-100">
      <DeckList pack={pack ? pack : undefined} />
    </div>
  );
}
