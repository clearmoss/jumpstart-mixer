import { Toggle } from "@/components/ui/toggle.tsx";
import { useAtom } from "jotai";
import { showCategoriesAtom } from "@/lib/atoms.ts";
import { cn } from "@/lib/utils.ts";

function CategoriesToggle({ className }: { className?: string }) {
  const [showCategories, setShowCategories] = useAtom(showCategoriesAtom);

  return (
    <div className={cn(className)}>
      <Toggle
        variant="outline"
        pressed={showCategories}
        onPressedChange={setShowCategories}
        className="h-8 w-48 cursor-pointer"
      >
        {showCategories ? "Visible Categories" : "Hidden Categories"}
      </Toggle>
    </div>
  );
}

export default CategoriesToggle;
