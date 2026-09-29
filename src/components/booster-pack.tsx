import type { SetCode } from "@/lib/utils.ts";

type BoosterPackProps = {
  set?: SetCode;
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
        onError={(event) => {
          const image = event.currentTarget;
          if (!image.src.endsWith("/rnd_pack.png")) {
            image.src = "/rnd_pack.png";
          }
        }}
      />
    </div>
  );
}
