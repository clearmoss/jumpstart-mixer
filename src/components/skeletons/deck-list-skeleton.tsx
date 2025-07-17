import { Skeleton } from "@/components/ui/skeleton.tsx";

function DeckListSkeleton() {
  return (
    <div className="flex flex-col gap-8" data-testid="deck-list-skeleton">
      <div>
        <Skeleton className="mb-2 h-6 w-1/2" />
        <div className="flex flex-col gap-2 pl-4">
          <Skeleton className="h-4 w-full" />
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
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export default DeckListSkeleton;
