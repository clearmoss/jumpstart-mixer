import { useAtomValue } from "jotai";
import { currentSidebarDeckListAtom } from "@/lib/atoms.ts";
import DeckList from "@/components/deck-list.tsx";

export function SidebarDeckList() {
  const { pack } = useAtomValue(currentSidebarDeckListAtom);

  if (!pack) {
    return null;
  }

  return (
    <div className="w-100">
      <DeckList pack={pack} />
    </div>
  );
}
