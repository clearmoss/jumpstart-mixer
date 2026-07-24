import { createFileRoute, Link } from "@tanstack/react-router";
import { type JSX, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import Loading from "@/components/loading.tsx";
import { BoosterPack } from "@/components/booster-pack.tsx";
import { cn, getThemeCard, type MtgSet } from "@/lib/utils.ts";
import ControlPanel from "@/components/control-panel.tsx";
import DuplicatesToggle from "@/components/duplicates-toggle.tsx";
import { useAtom } from "jotai";
import { setFilterAtom } from "@/lib/atoms.ts";
import { packsQueryOptions } from "@/lib/queries.ts";
import type { PackFile } from "@/lib/types.ts";
import { useFilteredPacks } from "@/hooks/use-filtered-packs.ts";
import { usePackCombination } from "@/hooks/use-pack-combination.ts";
import { CombinationHeader } from "@/components/combination-header.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CardImage } from "@/components/card-image.tsx";
import CopyButton from "@/components/copy-button.tsx";
import { RotateCcw } from "lucide-react";
import PackCount from "@/components/pack-count.tsx";

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

// scopes the layoutId so the pack animations stay separate
// between the first selection phase and the second selection phase
type LayoutScope = "1" | "2";

type InteractiveState = {
  status: InteractiveStatus;
  pack1: PackFile | undefined;
  set1: MtgSet | "RND" | undefined;
  pack2: PackFile | undefined;
  set2: MtgSet | "RND" | undefined;
  resetKey: number;
};

type InteractiveEvent =
  | { type: "SELECT_PACK"; payload: { pack: PackFile; set: MtgSet | "RND" } }
  | { type: "PROCEED" }
  | { type: "RESET" };

const initialState: InteractiveState = {
  status: "FIRST_SELECTION",
  pack1: undefined,
  set1: undefined,
  pack2: undefined,
  set2: undefined,
  resetKey: 0,
};

// shared animation timing for the pack reveal overlay, used by both reveal slots
const REVEAL_TRANSITION = {
  duration: 3.5,
  times: [0, 0.3, 0.8, 1],
  ease: "easeInOut" as const,
  y: [0, 0, 250, 250],
  opacity: [1, 1, 0, 0],
};

// gives the pack image time to move before the theme card appears behind it
const THEME_CARD_DELAY = 0.5;

function interactiveReducer(
  state: InteractiveState,
  event: InteractiveEvent,
): InteractiveState {
  switch (event.type) {
    case "SELECT_PACK":
      if (state.status === "FIRST_SELECTION") {
        return {
          ...state,
          pack1: event.payload.pack,
          set1: event.payload.set,
          status: "FIRST_REVEAL",
        };
      }
      if (state.status === "SECOND_SELECTION") {
        return {
          ...state,
          pack2: event.payload.pack,
          set2: event.payload.set,
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
      return {
        ...initialState,
        resetKey: state.resetKey + 1, // new key to break continuity with old animation components
      };
    default:
      return state;
  }
}

interface RevealSlotProps {
  pack: PackFile;
  set: MtgSet | "RND" | undefined;
  isComplete: boolean;
  isRevealing: boolean;
  layoutSuffix: LayoutScope;
  entryStartX: number;
  onRevealComplete: () => void;
  resetKey: number;
}

function RevealSlot({
  pack,
  set,
  isComplete,
  isRevealing,
  layoutSuffix,
  entryStartX,
  onRevealComplete,
  resetKey,
}: RevealSlotProps): JSX.Element {
  return (
    <motion.div
      layout="position"
      className="relative flex flex-col items-center justify-center"
    >
      <motion.div
        layout="position"
        initial={{ opacity: 0, x: entryStartX }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          opacity: { delay: THEME_CARD_DELAY },
        }}
        className="w-70"
      >
        <Link
          to={"/packs/$packId"}
          params={{ packId: pack.meta.publicId }}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block w-full px-3",
            !isComplete && "pointer-events-none",
          )}
        >
          <CardImage
            clickable={false}
            card={getThemeCard(pack)}
            className="w-full"
          />
        </Link>
      </motion.div>

      {/* pack overlay for reveal */}
      <AnimatePresence>
        {isRevealing && set && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <motion.div
              layoutId={`pack-${set}-${layoutSuffix}-${resetKey}`}
              // this outer container handles the layout translation
              className="relative flex items-center justify-center"
            >
              <motion.div
                // this inner container handles the downward slide
                initial={{ y: 0, opacity: 1 }}
                animate={{
                  y: REVEAL_TRANSITION.y,
                  opacity: REVEAL_TRANSITION.opacity,
                }}
                transition={{
                  duration: REVEAL_TRANSITION.duration,
                  times: REVEAL_TRANSITION.times,
                  ease: REVEAL_TRANSITION.ease,
                }}
                onAnimationComplete={onRevealComplete}
              >
                <BoosterPack set={set === "RND" ? undefined : set} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RouteComponent(): JSX.Element {
  const [setFilter] = useAtom(setFilterAtom);
  const [state, dispatch] = useReducer(interactiveReducer, initialState);
  const { pack1, set1, pack2, set2, status, resetKey } = state;
  const filteredPacks = useFilteredPacks({ excludeTheme: pack1?.data.name });
  const { comboName, deckListString, bgGradientColors } = usePackCombination(
    pack1,
    pack2,
  );

  const handlePackClick = (set: MtgSet | "RND") => {
    if (status !== "FIRST_SELECTION" && status !== "SECOND_SELECTION") return;
    if (!filteredPacks.length) return;

    // we can only use packs in the selected set
    const pool: PackFile[] =
      set === "RND"
        ? filteredPacks
        : filteredPacks.filter((pack) => pack.data.code === set);

    if (!pool.length) return;
    const chosenPack = pool[Math.floor(Math.random() * pool.length)];

    // pass the chosen set so we know which visual layoutId to transition (including RND)
    dispatch({ type: "SELECT_PACK", payload: { pack: chosenPack, set } });
  };

  // scope the layoutId so the pack animations don't get confused
  // between the first selection phase and the second selection phase
  const layoutIdScope: LayoutScope =
    status === "FIRST_SELECTION" || status === "FIRST_REVEAL" ? "1" : "2";

  const isComplete = status === "COMPLETE";

  return (
    <div className="mx-auto flex flex-col items-center gap-8 p-8">
      <ControlPanel
        className="w-full max-w-350"
        settings={
          <ControlPanel.Settings showCategories={false}>
            <DuplicatesToggle />
          </ControlPanel.Settings>
        }
        actions={
          <ControlPanel.Actions>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  onClick={() => dispatch({ type: "RESET" })}
                  size="sm"
                  className="flex h-10 w-full cursor-pointer gap-2 sm:w-56"
                  variant="secondary"
                  disabled={status === "FIRST_SELECTION"}
                >
                  <RotateCcw />
                  Start Over
                </Button>
                <CopyButton
                  size="sm"
                  variant="default"
                  textToCopy={deckListString}
                  buttonText="Copy Combined Decklist"
                  disabled={!deckListString || status !== "COMPLETE"}
                  className="flex h-10 w-full gap-2 sm:w-56"
                />
              </div>
              <PackCount filteredPacks={filteredPacks} />
            </div>
          </ControlPanel.Actions>
        }
      />

      <motion.div
        key={resetKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex min-h-150 w-full flex-col items-center justify-start"
      >
        {/* header with combo title */}
        <AnimatePresence>
          {isComplete && pack1 && pack2 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center justify-center"
            >
              <Link
                to={`/mixer`}
                search={{
                  packId1: pack1.meta.publicId,
                  packId2: pack2.meta.publicId,
                }}
                className="w-full max-w-3xl"
              >
                <CombinationHeader
                  comboName={comboName}
                  bgGradientColors={bgGradientColors}
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* main section */}
        <div className="relative z-0 flex w-full flex-col items-start justify-center gap-8 pt-16 md:flex-row">
          {/* slot 1: left theme card */}
          <AnimatePresence>
            {pack1 && (
              <RevealSlot
                pack={pack1}
                set={set1}
                isComplete={isComplete}
                isRevealing={status === "FIRST_REVEAL"}
                layoutSuffix="1"
                entryStartX={50}
                onRevealComplete={() => dispatch({ type: "PROCEED" })}
                resetKey={resetKey}
              />
            )}
          </AnimatePresence>

          {/* slot 2: center pack array */}
          <AnimatePresence mode="popLayout">
            {(status === "FIRST_SELECTION" ||
              status === "SECOND_SELECTION") && (
              <motion.div
                key="pack-selection"
                layout="position"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="z-20 flex flex-wrap items-center justify-center gap-4"
              >
                {setFilter.length > 1 && (
                  <motion.div
                    layoutId={`pack-RND-${layoutIdScope}-${resetKey}`}
                    className="flex items-center justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handlePackClick("RND")}
                      disabled={filteredPacks.length < 1}
                      aria-label="Select a random pack"
                      aria-disabled={filteredPacks.length < 1}
                      title={
                        filteredPacks.length < 1 ? "No packs left" : undefined
                      }
                      className="block cursor-pointer p-2"
                    >
                      <BoosterPack />
                    </motion.button>
                  </motion.div>
                )}
                {setFilter.map((set) => {
                  const hasAvailablePacks = filteredPacks.some(
                    (pack) => pack.data.code === set,
                  );
                  return (
                    <motion.div
                      key={set}
                      layoutId={`pack-${set}-${layoutIdScope}-${resetKey}`}
                      className="flex items-center justify-center"
                    >
                      <motion.button
                        whileHover={hasAvailablePacks ? { scale: 1.1 } : {}}
                        onClick={() => handlePackClick(set)}
                        disabled={!hasAvailablePacks}
                        aria-label={
                          hasAvailablePacks
                            ? `Select a ${set} pack`
                            : `No ${set} packs left`
                        }
                        aria-disabled={!hasAvailablePacks}
                        title={
                          hasAvailablePacks ? undefined : `No ${set} packs left`
                        }
                        animate={{ opacity: hasAvailablePacks ? 1 : 0.5 }}
                        className="block cursor-pointer p-2"
                      >
                        <BoosterPack set={set} />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* slot 3: right theme card */}
          <AnimatePresence>
            {pack2 && (
              <RevealSlot
                pack={pack2}
                set={set2}
                isComplete={isComplete}
                isRevealing={status === "SECOND_REVEAL"}
                layoutSuffix="2"
                entryStartX={-50}
                onRevealComplete={() => dispatch({ type: "PROCEED" })}
                resetKey={resetKey}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
