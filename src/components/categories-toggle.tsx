import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAtom } from "jotai";
import { showCategoriesAtom } from "@/lib/atoms.ts";
import { cn } from "@/lib/utils.ts";

function CategoriesToggle({ className }: { className?: string }) {
  const [showCategories, setShowCategories] = useAtom(showCategoriesAtom);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        id="categories-toggle"
        checked={showCategories}
        onCheckedChange={setShowCategories}
        className="cursor-pointer"
      />
      <Label htmlFor="categories-toggle" className="cursor-pointer">
        Card Categories
      </Label>
    </div>
  );
}

export default CategoriesToggle;
