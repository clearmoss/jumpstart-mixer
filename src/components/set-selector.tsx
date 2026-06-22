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
import { useAtom } from "jotai";
import { setFilterAtom } from "@/lib/atoms.ts";
import { SETS, type MtgSet, cn } from "@/lib/utils.ts";
import { Label } from "@/components/ui/label";
import { useId } from "react";

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
      (set) => set.code,
    ) as MtgSet[];

    setSetFilter(sortedValues);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-2 sm:w-auto sm:min-w-80",
        className,
      )}
    >
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
            className="text-muted-foreground/50 hover:text-muted-foreground ml-auto size-4 shrink-0 transition-colors"
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
