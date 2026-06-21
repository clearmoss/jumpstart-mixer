import { memo, type ReactNode, useRef } from "react";
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
import { Button } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import { useAtom } from "jotai";
import { isNavMenuOpenAtom } from "@/lib/atoms.ts";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture.ts";
import { useDocumentMethodPolyfill } from "@/hooks/use-document-method-polyfill.ts";

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

const navLinks = [
  { to: "/packs", label: "Packs" },
  { to: "/mixer", label: "Mixer" },
  { to: "/about", label: "About" },
];

const Logo = memo(() => (
  <Link
    to="/"
    aria-label="Jumpstart Mixer Home"
    className="cursor-pointer bg-linear-to-br from-orange-100 to-orange-300 bg-clip-text text-2xl font-semibold tracking-widest text-transparent opacity-[.9] brightness-125 drop-shadow-sm transition-opacity duration-300 ease-in-out select-none hover:opacity-100"
  >
    Jumpstart Mixer
  </Link>
));

const DesktopNav = memo(() => (
  <nav className="hidden gap-8 text-lg md:flex">
    {navLinks.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        activeProps={{ className: "font-bold" }}
        preload={link.to === "/mixer" ? false : undefined}
        className="text-white transition-colors duration-300 select-none hover:text-orange-200"
      >
        {link.label}
      </Link>
    ))}
  </nav>
));

const MainHeader = memo(({ children }: { children: ReactNode }) => (
  <header className="flex items-center justify-between bg-orange-600 p-4">
    <Logo />

    <div className="flex items-center gap-6">
      <DesktopNav />

      <div className="hidden md:block">
        <ThemeToggle />
      </div>

      {children}
    </div>
  </header>
));

function RootComponent() {
  const [open, setOpen] = useAtom(isNavMenuOpenAtom);
  useDocumentMethodPolyfill(open); // prevents console errors, see implementation for more details

  // create a ref to attach to the SheetContent
  const sheetContentRef = useRef<HTMLDivElement>(null);

  // open menu gesture
  // attached to the global window, only enabled when the menu is closed
  useSwipeGesture({
    onSwipeLeft: () => setOpen(true),
    enabled: !open,
  });

  // close menu gesture
  useSwipeGesture({
    onSwipeRight: () => setOpen(false),
    enabled: open,
    targetRef: sheetContentRef,
  });

  return (
    <>
      <HeadContent />
      <MainHeader>
        {/* mobile navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="none"
                  className="cursor-pointer transition-colors duration-300 hover:bg-orange-500"
                />
              }
            >
              <Menu className="text-white" />
              <span className="sr-only">Open Menu</span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col p-0"
              ref={sheetContentRef} // attach ref for the swipe hook
              initialFocus={false}
              finalFocus={false}
            >
              <SheetHeader className="border-none p-0">
                <SheetTitle className="sr-only">
                  Main Navigation Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex grow flex-col justify-center px-6 pt-6">
                <Link
                  to={"/"}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "font-bold" }}
                  className="hover:text-muted-foreground border-b py-4 text-xl transition-colors duration-300 select-none last:border-0"
                >
                  Home
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "font-bold" }}
                    preload={link.to === "/mixer" ? false : undefined}
                    className="hover:text-muted-foreground border-b py-4 text-xl transition-colors duration-300 select-none last:border-0"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center justify-between border-t bg-orange-600 p-4">
                <span className="text-lg font-medium text-white">Theme</span>
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </MainHeader>

      <main className="justify-center p-2 sm:p-0">
        <Outlet />
      </main>

      <Scripts />
      <TanStackRouterDevtools />
    </>
  );
}
