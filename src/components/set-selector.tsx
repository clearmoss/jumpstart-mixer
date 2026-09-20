import { useAtom } from "jotai";
import { useId } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { setFilterAtom } from "@/lib/atoms.ts";
import { SETS, type MtgSet, cn } from "@/lib/utils.ts";

function SetSelector({ className }: { className?: string }) {
  const id = useId();
  const anchorRef = useComboboxAnchor();
  const [setFilter, setSetFilter] = useAtom(setFilterAtom);

  const handleValueChange = (newValues: string[]) => {
    if (newValues.length === 0) {
      return;
    }

    // order will match the order of the SETS array
    const sortedValues = SETS.filter((set) => newValues.includes(set.code)).map(
      (set) => set.code
    ) as MtgSet[];

    setSetFilter(sortedValues);
  };

  return (
    <div className={cn("flex w-full flex-col items-start gap-2", className)}>
      <Label htmlFor={id}>Allowed Sets</Label>
      <Combobox multiple value={setFilter} onValueChange={handleValueChange}>
        <ComboboxChips
          ref={anchorRef}
          className="min-h-10 w-full cursor-pointer"
          data-testid="set-selector-button"
        >
          {setFilter.map((setCode) => {
            const set = SETS.find((s) => s.code === setCode);
            return <ComboboxChip key={setCode}>{set?.name}</ComboboxChip>;
          })}
          <ComboboxTrigger
            id={id}
            className="ml-auto size-4 shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {SETS.map((set) => (
              <ComboboxItem
                key={set.code}
                value={set.code}
                data-testid={`set-selector-item-${set.code}`}
              >
                {set.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export default SetSelector;
