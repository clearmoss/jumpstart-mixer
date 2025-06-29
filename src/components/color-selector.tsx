import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai/index";
import { colorFilterAtom } from "@/lib/atoms.ts";
import { COLORS } from "@/lib/utils.ts";

function ColorSelector() {
  const [colorFilter, setColorFilter] = useAtom(colorFilterAtom);

  const handleCheckedChange = (colorCode: string) => {
    if (colorFilter.includes(colorCode) && colorFilter.length === 1) {
      return;
    }

    setColorFilter((currentSelected) => {
      const newSelected = currentSelected.includes(colorCode)
        ? currentSelected.filter((c) => c !== colorCode)
        : [...currentSelected, colorCode];

      // order will match the order of the COLORS array
      return COLORS.map((color) => color.code).filter((code) =>
        newSelected.includes(code),
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-24">
          {colorFilter.length > 0 ? colorFilter : "No Colors"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Allowed Colors</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COLORS.map((color) => (
          <DropdownMenuCheckboxItem
            key={color.code}
            checked={colorFilter.includes(color.code)}
            onCheckedChange={() => handleCheckedChange(color.code)}
            onSelect={(e) => e.preventDefault()}
          >
            {color.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ColorSelector;
