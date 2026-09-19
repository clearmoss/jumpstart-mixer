import type { MtgSet } from "@/lib/utils.ts";

type BoosterPackProps = {
  set?: MtgSet;
  className?: string;
};

export function BoosterPack({ set, className }: BoosterPackProps) {
  const setCode = set ? set : "RND";
  const imageUrl = `/${setCode.toLowerCase()}_pack.png`;

  return (
    <div className={className ?? "w-40 md:w-70"}>
      <img
        src={imageUrl}
        alt="Pack Image"
        width={530}
        height={1000}
        draggable={false}
        className="h-auto w-full"
      />
    </div>
  );
}
