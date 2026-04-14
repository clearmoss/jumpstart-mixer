import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { store } from "@/lib/atoms.ts";
import { persister } from "@/lib/persister.ts";
import { queryClient } from "@/lib/query-client.ts";
import { router } from "@/lib/router.ts";

export function App() {
  return (
    <JotaiProvider store={store}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </JotaiProvider>
  );
}
