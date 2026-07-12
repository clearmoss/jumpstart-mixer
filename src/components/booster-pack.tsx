import type { MtgSet } from "@/lib/utils.ts";

type BoosterPackProps = { set?: MtgSet };

export function BoosterPack({ set }: BoosterPackProps) {
  const setCode = set ? set : "RND";
  const imageUrl = `/${setCode.toLowerCase()}_pack.png`;

  return (
    <div>
      <img src={imageUrl} alt="Pack Image" className="h-auto w-64" />
    </div>
  );
}
