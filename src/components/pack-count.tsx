import type { PackFile } from "@/lib/types.ts";

import { Badge } from "@/components/ui/badge.tsx";

type PackCountProps = {
  filteredPacks: PackFile[];
};

function PackCount({ filteredPacks }: PackCountProps) {
  return (
    <Badge variant="secondary" data-testid="pack-count">
      {filteredPacks.length} {filteredPacks.length === 1 ? "pack" : "packs"}
    </Badge>
  );
}

export default PackCount;
