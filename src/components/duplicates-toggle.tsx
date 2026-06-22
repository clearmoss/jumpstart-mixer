import { Toggle } from "@/components/ui/toggle.tsx";
import { useAtom } from "jotai";
import { allowDuplicatesAtom } from "@/lib/atoms.ts";
import { cn } from "@/lib/utils.ts";

function DuplicatesToggle({ className }: { className?: string }) {
  const [allowDuplicates, setAllowDuplicates] = useAtom(allowDuplicatesAtom);

  return (
    <div className={cn(className)}>
      <Toggle
        variant="outline"
        pressed={allowDuplicates}
        onPressedChange={setAllowDuplicates}
        className="h-8 w-48 cursor-pointer"
      >
        {allowDuplicates ? "Duplicates Allowed" : "Duplicates Forbidden"}
      </Toggle>
    </div>
  );
}

export default DuplicatesToggle;
