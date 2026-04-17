import { useState, useEffect } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import type { QueryClient } from "@tanstack/react-query";
import { packIndexQueryOptions, packsQueryOptions } from "@/lib/queries.ts";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: ({ context }) => {
      void context.queryClient.prefetchQuery(packIndexQueryOptions);
      void context.queryClient.prefetchQuery(packsQueryOptions);
    },
    head: () => ({
      meta: [
        {
          title: "Jumpstart Mixer", // default title
        },
      ],
    }),
    component: RootComponent,
  },
);

function RootComponent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // mobile menu
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  return (
    <>
      <HeadContent />
      <header className="flex items-center justify-between bg-orange-500 px-4 py-3 md:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="cursor-pointer bg-linear-to-br from-orange-100 to-orange-300 bg-clip-text text-2xl tracking-widest text-transparent opacity-[.9] brightness-125 drop-shadow-sm transition duration-500 ease-in-out select-none hover:opacity-100"
          >
            Jumpstart Mixer
          </Link>
          <nav className="hidden items-baseline gap-6 md:flex">
            <Link
              to="/packs"
              className="text-muted select-none [&.active]:font-bold"
            >
              Packs
            </Link>
            <Link
              to="/mixer"
              search={{}}
              className="text-muted select-none [&.active]:font-bold"
            >
              Mixer
            </Link>
            <Link
              to="/about"
              className="text-muted select-none [&.active]:font-bold"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="md:hidden">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-white"
                >
                  <Menu className="size-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="md:hidden">
                <DropdownMenuItem asChild>
                  <Link
                    to="/packs"
                    className="cursor-pointer [&.active]:font-bold"
                  >
                    Packs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/mixer"
                    className="cursor-pointer [&.active]:font-bold"
                    search={{}}
                  >
                    Mixer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/about"
                    className="cursor-pointer [&.active]:font-bold"
                  >
                    About
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <hr />
      <div className="min-h-screen justify-center">
        <Outlet />
      </div>
      <Scripts />
      <TanStackRouterDevtools />
    </>
  );
}
