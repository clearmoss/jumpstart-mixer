import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Deck } from "@/lib/types";

const { mockQueueAdd } = vi.hoisted(() => {
  // Make the mock synchronous to remove timing-related flakiness
  return { mockQueueAdd: vi.fn((task) => task()) };
});

vi.mock("p-queue", () => ({
  default: class {
    add = mockQueueAdd;
  },
}));

const { mockPrefetchQuery } = vi.hoisted(() => {
  return { mockPrefetchQuery: vi.fn() };
});

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: mockPrefetchQuery,
    }),
  };
});

vi.mock("@/lib/queries", () => ({
  themeCardQueryOptions: (themeName: string, setCode: string) => ({
    queryKey: ["themeCard", themeName, setCode],
    queryFn: async () => ({ success: true }),
  }),
}));

describe("useThemeCardPreloader hook", () => {
  // variable to hold the hook, which will be dynamically imported.
  let useThemeCardPreloader: typeof import("@/hooks/use-theme-card-preloader").useThemeCardPreloader;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // import a fresh version of the hook for each test
    const { useThemeCardPreloader: freshHook } =
      await import("@/hooks/use-theme-card-preloader");
    useThemeCardPreloader = freshHook;
  });

  it("should add a prefetch task to the queue when a pack is provided", async () => {
    const mockPack = {
      name: "Dragons 1",
      code: "JMP",
      mainBoard: [],
      releaseDate: null,
      sealedProductUuids: "",
      sideBoard: [],
      type: "",
    } as Deck;

    renderHook(() => useThemeCardPreloader(mockPack));

    await waitFor(() => {
      expect(mockQueueAdd).toHaveBeenCalledTimes(1);
      expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
      expect(mockPrefetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ["themeCard", "Dragons", "JMP"],
        }),
      );
    });
  });

  it("should not add a prefetch task to the queue if pack is undefined", () => {
    renderHook(() => useThemeCardPreloader(undefined));

    expect(mockQueueAdd).not.toHaveBeenCalled();
    expect(mockPrefetchQuery).not.toHaveBeenCalled();
  });

  it("should prefetch a new theme when the pack changes", async () => {
    const pack1 = {
      name: "Dragons 1",
      code: "JMP",
      mainBoard: [],
      releaseDate: null,
      sealedProductUuids: "",
      sideBoard: [],
      type: "",
    } as Deck;
    const pack2 = {
      name: "Elves 2",
      code: "JMP",
      mainBoard: [],
      releaseDate: null,
      sealedProductUuids: "",
      sideBoard: [],
      type: "",
    } as Deck;

    const { rerender } = renderHook(({ pack }) => useThemeCardPreloader(pack), {
      initialProps: { pack: pack1 },
    });

    await waitFor(() => expect(mockPrefetchQuery).toHaveBeenCalledTimes(1));

    rerender({ pack: pack2 });

    await waitFor(() => expect(mockPrefetchQuery).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(mockPrefetchQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          queryKey: ["themeCard", "Elves", "JMP"],
        }),
      ),
    );
  });

  it("should not add a prefetch task for an already prefetched theme", async () => {
    const getMockPack = (): Deck => ({
      name: "Dragons 1",
      code: "JMP",
      mainBoard: [],
      releaseDate: null,
      sealedProductUuids: "",
      sideBoard: [],
      type: "",
    });

    const { rerender } = renderHook(({ pack }) => useThemeCardPreloader(pack), {
      initialProps: { pack: getMockPack() },
    });

    await waitFor(() => {
      expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
    });

    rerender({ pack: getMockPack() });

    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
  });
});
