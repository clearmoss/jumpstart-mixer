import { createRouter } from "@tanstack/react-router";
import { queryClient } from "./query-client";
import { routeTree } from "../routeTree.gen";
import { BASEPATH } from "./utils";
import { CircleSlash } from "lucide-react";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: BASEPATH,
  defaultNotFoundComponent: () => {
    return (
      <div className="flex min-h-screen flex-col items-center gap-4 pt-32">
        <CircleSlash size={64} className="text-orange-400" />
        <h1 className="text-3xl font-bold">404 Not Found</h1>
        <p className="text-gray-500">This page does not exist.</p>
      </div>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
