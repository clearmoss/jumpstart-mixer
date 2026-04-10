import { createRouter } from "@tanstack/react-router";
import { queryClient } from "./query-client";
import { routeTree } from "../routeTree.gen";
import { BASEPATH } from "./utils";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: BASEPATH,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
