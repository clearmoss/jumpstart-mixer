import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePackHover } from "@/hooks/use-pack-hover";
import { useSetAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import {
  store,
  currentSidebarDeckListAtom,
  currentSidebarCardAtom,
} from "@/lib/atoms";
import {
  themeCardFetchQueue,
  themeCardFetchTracker,
} from "@/hooks/use-theme-card-preloader";
import type { CardDeck, Deck } from "@/lib/types";

const mockCard = (overrides: Partial<CardDeck> = {}): CardDeck =>
  ({
    name: "Mock Card",
    setCode: "JMP",
    number: "1",
    rarity: "common",
    colors: [],
    colorIdentity: [],
    type: "Creature",
    types: ["Creature"],
    subtypes: [],
    supertypes: [],
    text: "",
    manaValue: 0,
    convertedManaCost: 0,
    layout: "normal",
    identifiers: {
      scryfallId: "1",
      scryfallOracleId: "1",
      scryfallIllustrationId: "1",
    },
    availability: [],
    borderColor: "black",
    finishes: [],
    frameVersion: "2015",
    hasFoil: false,
    hasNonFoil: true,
    isFoil: false,
    language: "en",
    legalities: {},
    purchaseUrls: {},
    count: 1,
    uuid: "1",
    ...overrides,
  }) as CardDeck;

vi.mock("p-queue", () => ({
  default: class {
    add = vi.fn((task) => task());
    clear = vi.fn();
  },
}));

vi.mock("jotai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("jotai")>()),
  useSetAtom: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: vi.fn(),
}));

vi.mock("@/lib/atoms", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/atoms")>()),
  store: { get: vi.fn() },
}));

describe("usePackHover", () => {
  const mockSetCurrentSidebarDeckList = vi.fn();
  const mockSetCurrentSidebarCard = vi.fn();
  const mockQueryClient = { getQueryData: vi.fn(), fetchQuery: vi.fn() };

  const mockPack: Deck = {
    name: "Dragons 1",
    code: "JMP",
    mainBoard: [],
    releaseDate: null,
    sealedProductUuids: "",
    sideBoard: [],
    type: "theme",
  };
  const mockPublicId = "dragons-1-jmp";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSetAtom).mockImplementation((atom: unknown) => {
      if (atom === currentSidebarDeckListAtom)
        return mockSetCurrentSidebarDeckList;
      if (atom === currentSidebarCardAtom) return mockSetCurrentSidebarCard;
      return vi.fn();
    });
    vi.mocked(useQueryClient).mockReturnValue(
      mockQueryClient as unknown as ReturnType<typeof useQueryClient>,
    );
    themeCardFetchQueue.clear();
    themeCardFetchTracker.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should handle immediate updates and caching", async () => {
    const { result } = renderHook(() => usePackHover(mockPack, mockPublicId));
    act(() => {
      result.current.handleMouseEnter();
    });
    expect(mockSetCurrentSidebarDeckList).toHaveBeenCalledWith({
      pack: mockPack,
      publicId: mockPublicId,
    });

    const mockCachedCard = mockCard({ name: "Dragons" });
    mockQueryClient.getQueryData.mockReturnValue(mockCachedCard);
    act(() => {
      result.current.handleMouseEnter();
    });
    expect(mockSetCurrentSidebarCard).toHaveBeenCalledWith(mockCachedCard);
    expect(mockQueryClient.fetchQuery).not.toHaveBeenCalled();
  });

  it("should debounce fetch and handle stale hovers or errors", async () => {
    mockQueryClient.getQueryData.mockReturnValue(undefined);
    const mockFetchedCard = mockCard({ name: "Dragons" });
    let resolveFetch: (val: CardDeck) => void;
    mockQueryClient.fetchQuery.mockReturnValue(
      new Promise((res) => {
        resolveFetch = res;
      }),
    );

    vi.mocked(store.get).mockImplementation((atom) =>
      atom === currentSidebarDeckListAtom ? { publicId: mockPublicId } : null,
    );

    const { result } = renderHook(() => usePackHover(mockPack, mockPublicId));
    act(() => {
      result.current.handleMouseEnter();
    });

    expect(mockQueryClient.fetchQuery).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockQueryClient.fetchQuery).toHaveBeenCalled();

    vi.mocked(store.get).mockReturnValue({ publicId: "different" });
    act(() => {
      resolveFetch!(mockFetchedCard);
    });
    await Promise.resolve();
    expect(mockSetCurrentSidebarCard).not.toHaveBeenCalledWith(mockFetchedCard);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQueryClient.fetchQuery.mockRejectedValue(new Error("fail"));
    act(() => {
      result.current.handleMouseEnter();
      vi.advanceTimersByTime(150);
    });
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it("should deduplicate high-priority fetches and cleanup", async () => {
    const cacheKey = "Dragons-JMP";
    const mockFetchedCard = mockCard({ name: "Dragons" });
    const fetchPromise = Promise.resolve(mockFetchedCard);

    themeCardFetchTracker.set(cacheKey, {
      promise: fetchPromise,
      priority: 10,
    });
    vi.mocked(store.get).mockReturnValue({ publicId: mockPublicId });
    mockQueryClient.getQueryData.mockReturnValue(mockFetchedCard);

    const { result, unmount } = renderHook(() =>
      usePackHover(mockPack, mockPublicId),
    );

    act(() => {
      result.current.handleMouseEnter();
      vi.advanceTimersByTime(150);
    });
    expect(mockQueryClient.fetchQuery).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mockSetCurrentSidebarCard).toHaveBeenCalledWith(mockFetchedCard),
    );

    vi.clearAllMocks();
    act(() => {
      result.current.handleMouseEnter();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(mockQueryClient.fetchQuery).not.toHaveBeenCalled();
  });
});
