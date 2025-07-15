import { useAtom } from "jotai";
import { cardSearchFilterAtom, packSearchFilterAtom } from "@/lib/atoms.ts";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import type { PrimitiveAtom } from "jotai";
import { X } from "lucide-react";

type DebouncedSearchInputProps = {
  searchAtom: PrimitiveAtom<string>;
  placeholder: string;
  dataTestId?: string;
};

function DebouncedSearchInput({
  searchAtom,
  placeholder,
  dataTestId,
}: DebouncedSearchInputProps) {
  const [globalSearch, setGlobalSearch] = useAtom(searchAtom);
  const [localSearch, setLocalSearch] = useState(globalSearch);

  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalSearch(localSearch);
    }, 200); // 200ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, setGlobalSearch]);

  return (
    <div className="relative w-full max-w-64">
      <Input
        placeholder={placeholder}
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="pr-10"
        data-testid={dataTestId}
        name={dataTestId}
      />
      {localSearch && (
        <button
          type="button"
          onClick={() => setLocalSearch("")}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
        >
          <X className="text-muted-foreground h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function PackSearch() {
  return (
    <DebouncedSearchInput
      searchAtom={packSearchFilterAtom}
      placeholder="Search pack names..."
      dataTestId="pack-search"
    />
  );
}

export function CardSearch() {
  return (
    <DebouncedSearchInput
      searchAtom={cardSearchFilterAtom}
      placeholder="Search cards in packs..."
      dataTestId="card-search"
    />
  );
}
