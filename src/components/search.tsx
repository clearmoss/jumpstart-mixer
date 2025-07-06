import { useAtom } from "jotai";
import { cardSearchFilterAtom, packSearchFilterAtom } from "@/lib/atoms.ts";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import type { PrimitiveAtom } from "jotai";

type DebouncedSearchInputProps = {
  searchAtom: PrimitiveAtom<string>;
  placeholder: string;
};

function DebouncedSearchInput({
  searchAtom,
  placeholder,
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
    <div className="w-full max-w-64">
      <Input
        placeholder={placeholder}
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
    </div>
  );
}

export function PackSearch() {
  return (
    <DebouncedSearchInput
      searchAtom={packSearchFilterAtom}
      placeholder="Search pack names..."
    />
  );
}

export function CardSearch() {
  return (
    <DebouncedSearchInput
      searchAtom={cardSearchFilterAtom}
      placeholder="Search cards in packs..."
    />
  );
}
