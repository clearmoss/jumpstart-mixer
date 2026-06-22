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
import { colorFilterAtom } from "@/lib/atoms.ts";
import { cn, COLORS, type MtgColor } from "@/lib/utils.ts";
import { Label } from "@/components/ui/label";
import { useId } from "react";

function ColorSelector({ className }: { className?: string }) {
  const id = useId();
  const anchorRef = useComboboxAnchor();
  const [colorFilter, setColorFilter] = useAtom(colorFilterAtom);

  const handleValueChange = (newValues: string[]) => {
    if (newValues.length === 0) {
      return;
    }

    // order will match the order of the COLORS array
    const sortedValues = COLORS.filter((c) => newValues.includes(c.code)).map(
      (c) => c.code,
    ) as MtgColor[];

    setColorFilter(sortedValues);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-2 sm:w-auto sm:min-w-80",
        className,
      )}
    >
      <Label htmlFor={id}>Allowed Colors</Label>
      <Combobox multiple value={colorFilter} onValueChange={handleValueChange}>
        <ComboboxChips
          ref={anchorRef}
          className="min-h-10 w-full cursor-pointer"
          data-testid="color-selector-button"
        >
          {colorFilter.map((colorCode) => {
            const color = COLORS.find((c) => c.code === colorCode);
            return <ComboboxChip key={colorCode}>{color?.name}</ComboboxChip>;
          })}
          <ComboboxTrigger
            id={id}
            className="text-muted-foreground/50 hover:text-muted-foreground ml-auto size-4 shrink-0 transition-colors"
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {COLORS.map((color) => (
              <ComboboxItem
                key={color.code}
                value={color.code}
                data-testid={`color-selector-item-${color.code}`}
              >
                {color.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export default ColorSelector;
