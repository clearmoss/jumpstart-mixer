import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAtom } from "jotai/index";
import { showCategoriesAtom } from "@/lib/atoms.ts";

function CategoriesToggle() {
  const [showCategories, setShowCategories] = useAtom(showCategoriesAtom);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="global-category"
        checked={showCategories}
        onCheckedChange={setShowCategories}
      />
      <Label htmlFor="global-category">Show Categories</Label>
    </div>
  );
}

export default CategoriesToggle;
