import { createRouter } from "@tanstack/react-router";
import { queryClient } from "./query-client";
import { routeTree } from "../routeTree.gen";
import { BASEPATH } from "./utils";
import { CircleSlash } from "lucide-react";

export const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: BASEPATH || "/",
  defaultErrorComponent: ({ error }) => {
    // check if the error message is a dynamic import failure
    const isChunkError =
      error instanceof Error &&
      /failed to fetch dynamically imported module|error loading dynamically imported module/i.test(
        error.message,
      );

    if (isChunkError) {
      // force a hard reload from the server to grab the new index.html and assets
      window.location.reload();
      return null;
    }

    console.error("Caught an Error:", error);

    // fallback for regular runtime errors
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold">Something went wrong!</h1>
        <p className="text-gray-500">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  },
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
