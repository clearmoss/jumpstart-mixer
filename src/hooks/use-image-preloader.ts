import { useEffect } from "react";

const preloadedUrls = new Set<string>();

export function useImagePreloader(urls: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    urls.forEach((url) => {
      if (!url || preloadedUrls.has(url)) {
        return;
      }

      const img = new Image();
      img.src = url;
      preloadedUrls.add(url);
    });
  }, [urls]);
}
