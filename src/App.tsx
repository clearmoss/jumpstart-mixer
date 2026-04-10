import { RouterProvider } from "@tanstack/react-router";
import { useIsRestoring } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import Loading from "@/components/loading.tsx";
import { store } from "@/lib/atoms.ts";
import { idbPersister } from "@/lib/persister.ts";
import { queryClient } from "@/lib/query-client.ts";
import { router } from "@/lib/router.ts";

export function App() {
  const isRestoring = useIsRestoring();

  if (isRestoring) {
    return <Loading />;
  }

  return (
    <JotaiProvider store={store}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: idbPersister,
          maxAge: Infinity,
        }}
      >
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </JotaiProvider>
  );
}
