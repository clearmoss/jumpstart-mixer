import type { ReactNode } from "react";
import { CardImage } from "@/components/card-image.tsx";
import { SidebarDeckList } from "@/components/sidebar-deck-list.tsx";
import { useAtomValue } from "jotai/index";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";
import MediaQuery from "react-responsive";

interface SidebarProps {
  showDeckList?: boolean;
  children?: ReactNode;
}

function Sidebar({ showDeckList = true, children }: SidebarProps) {
  return (
    <div
      className="dark:bg-secondary sticky top-0 hidden h-screen w-116 min-w-116 flex-col gap-4 self-start overflow-y-auto bg-orange-200 p-8 lg:flex"
      data-testid="sidebar"
    >
      {children}
      <div className="bg-popover relative top-0 left-0 flex min-h-134 items-center justify-center rounded-md border p-4 shadow-md">
        <MediaQuery minWidth={1024}>
          <CardImage
            card={useAtomValue(currentSidebarCardAtom)}
            className="w-full"
          />
        </MediaQuery>
      </div>
      {showDeckList && (
        <div className="bg-popover relative top-0 left-0 flex min-h-120 items-start justify-center rounded-md border p-6 shadow-md">
          <SidebarDeckList />
        </div>
      )}
    </div>
  );
}

export default Sidebar;
