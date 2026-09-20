import type { ReactNode } from "react";

import { useAtomValue } from "jotai";
import MediaQuery from "react-responsive";

import { CardImage } from "@/components/card-image.tsx";
import { SidebarDeckList } from "@/components/sidebar-deck-list.tsx";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";

interface SidebarProps {
  showDeckList?: boolean;
  children?: ReactNode;
}

function Sidebar({ showDeckList = true, children }: SidebarProps) {
  return (
    <div
      className="sticky top-0 hidden h-screen w-116 min-w-116 flex-col gap-4 self-start overflow-y-auto bg-orange-200 p-8 lg:flex dark:border-zinc-900 dark:bg-secondary"
      data-testid="sidebar"
    >
      {children}
      <div className="relative top-0 left-0 flex min-h-134 items-center justify-center rounded-xl border bg-popover p-4 shadow-md">
        <MediaQuery minWidth={1024}>
          <CardImage card={useAtomValue(currentSidebarCardAtom)} className="w-full" />
        </MediaQuery>
      </div>
      {showDeckList && (
        <div className="relative top-0 left-0 flex min-h-120 items-start justify-center rounded-xl border bg-popover p-6 shadow-md">
          <SidebarDeckList />
        </div>
      )}
    </div>
  );
}

export default Sidebar;
