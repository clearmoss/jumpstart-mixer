import { InfoIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton.tsx";

function DeckListSkeleton() {
  return (
    <div className="flex flex-col gap-8" data-testid="deck-list-skeleton">
      <div>
        <div className="mb-8 flex items-center gap-2 bg-accent px-4 py-2">
          <InfoIcon size={20} className="" />
          <span className="font-semibold">Hover over a pack to see its cards</span>
        </div>
        <Skeleton className="mb-2 h-6 w-1/2" />
        <div className="flex flex-col gap-2 pl-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-2 h-6 w-1/2" />
        <div className="flex flex-col gap-2 pl-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-2 h-6 w-1/2" />
        <div className="flex flex-col gap-2 pl-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export default DeckListSkeleton;
