import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAtom } from "jotai/index";
import { allowDuplicatesAtom } from "@/lib/atoms.ts";

function DuplicatesToggle() {
  const [allowDuplicates, setAllowDuplicates] = useAtom(allowDuplicatesAtom);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="global-category"
        checked={allowDuplicates}
        onCheckedChange={setAllowDuplicates}
      />
      <Label htmlFor="global-category">Allow Duplicates</Label>
    </div>
  );
}

export default DuplicatesToggle;
