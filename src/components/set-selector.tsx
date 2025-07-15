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
import { setFilterAtom } from "@/lib/atoms.ts";
import { SETS } from "@/lib/utils.ts";

function SetSelector() {
  const [setFilter, setSetFilter] = useAtom(setFilterAtom);

  const handleCheckedChange = (setCode: string) => {
    if (setFilter.includes(setCode) && setFilter.length === 1) {
      return;
    }

    setSetFilter((currentSelected) => {
      const newSelected = currentSelected.includes(setCode)
        ? currentSelected.filter((c) => c !== setCode)
        : [...currentSelected, setCode];

      // order will match the order of the SETS array
      return SETS.map((set) => set.code).filter((code) =>
        newSelected.includes(code),
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-32 cursor-pointer"
          data-testid="set-selector-button"
        >
          {setFilter.length > 0 ? setFilter.join(" ") : "No Sets"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Allowed Sets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SETS.map((set) => (
          <DropdownMenuCheckboxItem
            key={set.code}
            checked={setFilter.includes(set.code)}
            onCheckedChange={() => handleCheckedChange(set.code)}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
            data-testid={`set-selector-item-${set.code}`}
          >
            {set.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SetSelector;
