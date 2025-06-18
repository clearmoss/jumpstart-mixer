import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeToggle } from "@/components/theme-toggle.tsx";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="bg-orange-500 py-2 px-4 flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{" "}
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
          <Link to="/test" className="[&.active]:font-bold">
            Test
          </Link>{" "}
          <Link to="/packs" className="[&.active]:font-bold">
            Packs
          </Link>
          {/*<Link*/}
          {/*  to="/posts"*/}
          {/*  search={{*/}
          {/*    q: "post1",*/}
          {/*  }}*/}
          {/*  className="[&.active]:font-bold"*/}
          {/*>*/}
          {/*  Posts*/}
          {/*</Link>*/}
        </div>
        <ThemeToggle />
      </div>
      <hr />
      <div className="bg-orange-300 p-4">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
