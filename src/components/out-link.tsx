import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

function OutLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={cn("hyperlink", className)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default OutLink;
