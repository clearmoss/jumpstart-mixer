import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { RouterProvider } from "@tanstack/react-router";
import { Provider as JotaiProvider } from "jotai";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { store } from "@/lib/atoms.ts";
import { persister } from "@/lib/persister.ts";
import { queryClient } from "@/lib/query-client.ts";
import { router } from "@/lib/router.tsx";
import { ThemeProvider } from "@/providers/theme-provider.tsx";

import "./styles.css";

const rootElement = document.querySelector("#root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <JotaiProvider store={store}>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          <ThemeProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </PersistQueryClientProvider>
      </JotaiProvider>
    </StrictMode>
  );
}
