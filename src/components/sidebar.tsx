import type { ReactNode } from "react";
import { useSetAtom } from "jotai";
import { sidebarCardSlotRefAtom, sidebarPackSlotRefAtom } from "@/lib/atoms.ts";

interface SidebarProps {
  children?: ReactNode;
}

function Sidebar({ children }: SidebarProps) {
  const setSidebarPackSlotRef = useSetAtom(sidebarPackSlotRefAtom);
  const setSidebarCardSlotRef = useSetAtom(sidebarCardSlotRefAtom);

  return (
    <div className="sticky top-0 flex h-screen w-116 flex-col gap-4 self-start overflow-y-auto bg-orange-200 p-8">
      {children}
      <div
        ref={(node) => setSidebarPackSlotRef(node)}
        className="relative min-h-166"
      ></div>
      <div
        ref={(node) => setSidebarCardSlotRef(node)}
        className="relative"
      ></div>
    </div>
  );
}

export default Sidebar;
