import { useEffect } from "react";

// tell TypeScript that the Document interface might temporarily include this method
declare global {
  interface Document {
    hasAttribute?: (name: string) => boolean;
  }
}

export function useDocumentMethodPolyfill(enabled: boolean) {
  // this polyfill seems necessary to avoid console errors when using the current Base UI Sheet component
  // without it, an "eventTarget.hasAttribute is not a function" error can be reliably triggered by starting a click
  // inside the open sheet and then releasing it outside the document window
  useEffect(() => {
    if (!enabled) return;

    const originalHasAttribute = document.hasAttribute;

    if (!originalHasAttribute) {
      document.hasAttribute = () => {
        return false;
      };
    }

    return () => {
      if (!originalHasAttribute) {
        delete document.hasAttribute;
      } else {
        document.hasAttribute = originalHasAttribute;
      }
    };
  }, [enabled]);
}
