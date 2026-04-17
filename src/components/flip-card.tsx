import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";

interface FlipCardProps extends HTMLAttributes<HTMLDivElement> {
  frontImg: string;
  backImg: string;
  frontAlt?: string;
  backAlt?: string;
  speed?: number;
  delay?: number; // In milliseconds
  size?: number; // In pixels (width)
}

export const FlipCard: React.FC<FlipCardProps> = ({
  frontImg,
  backImg,
  frontAlt = "Card front",
  backAlt = "Card back",
  speed = 10,
  delay = 0,
  size = 50,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "relative isolate aspect-5/7 perspective-[1000px]",
        className,
      )}
      style={{ width: `${size}px` }}
    >
      <div
        className="animate-flip-spin relative h-full w-full transform-gpu transition-transform"
        style={{
          animationDuration: `${speed}s`,
          animationDelay: `${delay}ms`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="bg-muted absolute inset-0 h-full w-full overflow-hidden rounded-lg shadow-xl backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(1px)",
          }}
        >
          <img
            src={frontImg}
            alt={frontAlt}
            loading="eager"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="bg-muted absolute inset-0 h-full w-full overflow-hidden rounded-lg shadow-xl backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)",
          }}
        >
          <img
            src={backImg}
            alt={backAlt}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
