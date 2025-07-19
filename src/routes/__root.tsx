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
    component: () => {
      return (
        <>
          <HeadContent />
          <div className="flex items-baseline justify-between bg-orange-500 px-8 py-3">
            <div className="flex items-baseline gap-6">
              <Link
                to="/"
                className="cursor-pointer bg-gradient-to-br from-orange-100 to-orange-300 bg-clip-text text-2xl tracking-widest text-transparent opacity-[.9] brightness-125 drop-shadow-sm transition duration-500 ease-in-out select-none hover:opacity-100"
              >
                Jumpstart Mixer
              </Link>
              <Link to="/packs" className="text-muted [&.active]:font-bold">
                Packs
              </Link>
              <Link
                to="/mixer"
                search={{}}
                className="text-muted [&.active]:font-bold"
              >
                Mixer
              </Link>
              <Link to="/about" className="text-muted [&.active]:font-bold">
                About
              </Link>
            </div>
            <ThemeToggle />
          </div>
          <hr />
          <div className="min-h-[100vh] justify-center">
            <Outlet />
          </div>
          <Scripts />
          <TanStackRouterDevtools />
        </>
      );
    },
    notFoundComponent: () => <div>404 Not Found</div>,
  },
);
