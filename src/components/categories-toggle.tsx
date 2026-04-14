import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAtom } from "jotai";
import { showCategoriesAtom } from "@/lib/atoms.ts";

function CategoriesToggle() {
  const [showCategories, setShowCategories] = useAtom(showCategoriesAtom);

  return (
    <div className="flex items-center space-x-2">
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
