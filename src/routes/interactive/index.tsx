import { createFileRoute, Link } from "@tanstack/react-router";
import React, { type JSX, useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/loading.tsx";
import { BoosterPack } from "@/components/booster-pack.tsx";
import {
  cn,
  determinePackColors,
  filterPacks,
  makeDeckListString,
  type MtgColor,
  type MtgSet,
  populateDeckList,
  stripThemeName,
} from "@/lib/utils.ts";
import ControlPanel from "@/components/control-panel.tsx";
import DuplicatesToggle from "@/components/duplicates-toggle.tsx";
import { useAtom } from "jotai";
import {
  allowDuplicatesAtom,
  colorFilterAtom,
  setFilterAtom,
} from "@/lib/atoms.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { packsQueryOptions } from "@/lib/queries.ts";
import type { CardDeck, ClipboardCard, PackFile } from "@/lib/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { CardImage } from "@/components/card-image.tsx";
import CopyButton from "@/components/copy-button.tsx";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/interactive/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(packsQueryOptions);
  },
  head: () => {
    const title = "Interactive";
    return {
      meta: [
        {
          title: title,
        },
      ],
    };
  },
  component: RouteComponent,
  pendingComponent: () => <Loading />,
});

type InteractiveStatus =
  | "FIRST_SELECTION"
  | "FIRST_REVEAL"
  | "SECOND_SELECTION"
  | "SECOND_REVEAL"
  | "COMPLETE";

type InteractiveState = {
  status: InteractiveStatus;
  pack1: PackFile | undefined;
  pack2: PackFile | undefined;
};

type InteractiveEvent =
  | { type: "SELECT_PACK"; payload: PackFile }
  | { type: "PROCEED" }
  | { type: "RESET" };

const initialState: InteractiveState = {
  status: "FIRST_SELECTION",
  pack1: undefined,
  pack2: undefined,
};

const STATE_CONFIG: Record<InteractiveStatus, { title: string }> = {
  FIRST_SELECTION: { title: "Select your first pack" },
  FIRST_REVEAL: { title: "" },
  SECOND_SELECTION: { title: "Select your second pack" },
  SECOND_REVEAL: { title: "" },
  COMPLETE: { title: "" },
};

function interactiveReducer(
  state: InteractiveState,
  event: InteractiveEvent,
): InteractiveState {
  switch (event.type) {
    case "SELECT_PACK":
      if (state.status === "FIRST_SELECTION") {
        return {
          ...state,
          pack1: event.payload,
          status: "FIRST_REVEAL",
        };
      }
      if (state.status === "SECOND_SELECTION") {
        return {
          ...state,
          pack2: event.payload,
          status: "SECOND_REVEAL",
        };
      }
      return state;
    case "PROCEED":
      if (state.status === "FIRST_REVEAL")
        return { ...state, status: "SECOND_SELECTION" };
      if (state.status === "SECOND_REVEAL")
        return { ...state, status: "COMPLETE" };
      return state;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function RouteComponent(): JSX.Element {
  const { data: packs } = useSuspenseQuery(packsQueryOptions);
  const [allowDuplicates] = useAtom(allowDuplicatesAtom);
  const [colorFilter] = useAtom(colorFilterAtom);
  const [setFilter] = useAtom(setFilterAtom);

  const [state, dispatch] = useReducer(interactiveReducer, initialState);
  const { pack1, pack2, status } = state;

  const filteredPacks = useMemo(() => {
    const validPacks: PackFile[] = filterPacks(
      packs,
      colorFilter,
      setFilter,
      "",
      "",
    );

    // if the user picked a pack, and duplicates aren't allowed, strip it and its variants out
    if (!allowDuplicates && pack1) {
      const selectedTheme = stripThemeName(pack1.data.name);
      return validPacks.filter(
        (pack) => stripThemeName(pack.data.name) !== selectedTheme,
      );
    }

    return validPacks;
  }, [packs, colorFilter, setFilter, allowDuplicates, pack1]);

  const comboName = useMemo(() => {
    if (!pack1 || !pack2) return "";
    return `${stripThemeName(pack1.data.name)} + ${stripThemeName(pack2.data.name)}`;
  }, [pack1, pack2]);

  const currentDeckList = useMemo(() => {
    if (!pack1 || !pack2) return "";

    const deckList: ClipboardCard[] = [];
    populateDeckList(pack1.data, deckList);
    populateDeckList(pack2.data, deckList);
    return makeDeckListString(deckList);
  }, [pack1, pack2]);

  const bgGradientColors = useMemo(() => {
    const PACK_GRADIENT_COLORS: Record<MtgColor, string> = {
      W: "var(--color-amber-300)",
      U: "var(--color-sky-500)",
      B: "var(--color-neutral-700)",
      R: "var(--color-red-500)",
      G: "var(--color-green-500)",
      C: "var(--color-gray-400)",
    } as const;

    if (!pack1 || !pack2) return {};

    const pack1Colors = determinePackColors(pack1.data);
    const pack2Colors = determinePackColors(pack2.data);

    const colorCode1 = (pack1Colors[0]?.color ?? "C") as MtgColor;
    const colorCode2 = (pack2Colors[0]?.color ?? "C") as MtgColor;

    return {
      "--gradient-start": PACK_GRADIENT_COLORS[colorCode1],
      "--gradient-end": PACK_GRADIENT_COLORS[colorCode2],
    } as React.CSSProperties;
  }, [pack1, pack2]);

  const handlePackClick = (set: MtgSet | "RND") => {
    if (!filteredPacks.length) return;

    // we can only use packs in the selected set
    const pool: PackFile[] =
      set === "RND"
        ? filteredPacks
        : filteredPacks.filter((pack) => pack.data.code === set);

    if (!pool.length) return;
    const chosenPack = pool[Math.floor(Math.random() * pool.length)];
    dispatch({ type: "SELECT_PACK", payload: chosenPack });
  };

  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-16 p-8">
      <ControlPanel
        settings={
          <ControlPanel.Settings showCategories={false}>
            <DuplicatesToggle />
          </ControlPanel.Settings>
        }
      />

      <h2>{STATE_CONFIG[status].title}</h2>

      <div className="flex items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          {(status === "FIRST_SELECTION" || status === "SECOND_SELECTION") && (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex w-full items-center justify-center gap-8"
            >
              {setFilter.map((set) => {
                const hasAvailablePacks = filteredPacks.some(
                  (pack) => pack.data.code === set,
                );

                return (
                  <motion.button
                    key={set}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    exit={{ scale: 0 }}
                    onClick={() => handlePackClick(set)}
                    disabled={!hasAvailablePacks}
                    className="cursor-pointer disabled:opacity-50"
                  >
                    <BoosterPack set={set} />
                  </motion.button>
                );
              })}
              {setFilter.length > 1 && (
                <motion.button
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  exit={{ scale: 0 }}
                  onClick={() => handlePackClick("RND")}
                  disabled={filteredPacks.length < 1}
                  className="cursor-pointer"
                >
                  <BoosterPack />
                </motion.button>
              )}
              {status === "SECOND_SELECTION" && (
                <Button
                  onClick={() => dispatch({ type: "RESET" })}
                  size="sm"
                  className="flex h-10 w-full cursor-pointer gap-2 sm:w-56"
                  variant="secondary"
                >
                  <RotateCcw />
                  Start Over
                </Button>
              )}
            </motion.div>
          )}

          {(status === "FIRST_REVEAL" || status === "SECOND_REVEAL") && (
            <motion.div
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                // fade in, wait, then signal completion
                animate={{ opacity: [0, 1, 1] }}
                transition={{
                  duration: 4, // 2s fade-in + 2s hold
                  times: [0, 0.5, 1],
                  ease: "easeIn",
                }}
                // when the animation is finished, proceed to next state
                onAnimationComplete={() => {
                  dispatch({ type: "PROCEED" });
                }}
                className="flex w-sm items-center justify-center rounded-xl"
              >
                {status === "FIRST_REVEAL" && pack1 && (
                  <CardImage
                    clickable={false}
                    card={
                      {
                        // mock a partial CardDeck as only this data is needed to display a theme card
                        name: stripThemeName(pack1.data.name),
                        setCode: "F" + pack1.data.code,
                        imageUri: pack1.meta.themeCardUri,
                      } as CardDeck
                    }
                  />
                )}
                {status === "SECOND_REVEAL" && pack2 && (
                  <CardImage
                    clickable={false}
                    card={
                      {
                        // mock a partial CardDeck as only this data is needed to display a theme card
                        name: stripThemeName(pack2.data.name),
                        setCode: "F" + pack2.data.code,
                        imageUri: pack2.meta.themeCardUri,
                      } as CardDeck
                    }
                  />
                )}
              </motion.div>
            </motion.div>
          )}

          {status === "COMPLETE" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <div
                style={bgGradientColors}
                className={cn(
                  "flex w-full max-w-3xl items-center justify-center gap-4 rounded-xl px-6 py-4",
                  "bg-linear-[to_right,var(--gradient-start)_30%,var(--gradient-end)_70%]",
                )}
              >
                <h1 className="text-3xl font-bold text-white text-shadow-md">
                  {comboName}
                </h1>
              </div>
              <div className="flex w-3xl items-center justify-center gap-8 rounded-xl">
                {pack1 && (
                  <Link
                    to={"/packs/$packId"}
                    params={{ packId: pack1.meta.publicId }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardImage
                      clickable={false}
                      card={
                        {
                          // mock a partial CardDeck as only this data is needed to display a theme card
                          name: stripThemeName(pack1.data.name),
                          setCode: "F" + pack1.data.code,
                          imageUri: pack1.meta.themeCardUri,
                        } as CardDeck
                      }
                    />
                  </Link>
                )}
                {pack2 && (
                  <Link
                    to={"/packs/$packId"}
                    params={{ packId: pack2.meta.publicId }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardImage
                      clickable={false}
                      card={
                        {
                          // mock a partial CardDeck as only this data is needed to display a theme card
                          name: stripThemeName(pack2.data.name),
                          setCode: "F" + pack2.data.code,
                          imageUri: pack2.meta.themeCardUri,
                        } as CardDeck
                      }
                    />
                  </Link>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => dispatch({ type: "RESET" })}
                  size="sm"
                  className="flex h-10 w-full cursor-pointer gap-2 sm:w-56"
                  variant="secondary"
                >
                  <RotateCcw />
                  Start Over
                </Button>
                <CopyButton
                  size="sm"
                  variant="default"
                  textToCopy={currentDeckList}
                  buttonText="Copy Combined Decklist"
                  disabled={!currentDeckList}
                  className="flex h-10 w-full gap-2 sm:w-56"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
