import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import type { CardDeck, PackFile } from "@/lib/types.ts";
import { fetchAllPacks, handleError } from "@/lib/utils.ts";
import Pack from "@/components/pack.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clipboard, Shuffle } from "lucide-react";

export const Route = createFileRoute("/mixer/")({
  component: RouteComponent,
  loader: async () => {
    let packs: PackFile[] = [];
    let error: string | undefined;

    try {
      packs = await fetchAllPacks();
    } catch (err: unknown) {
      error = handleError(err);
    }

    return { packs, error };
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      packId1: (search.packId1 as string) || undefined,
      packId2: (search.packId2 as string) || undefined,
    };
  },
  pendingComponent: () => <div>Loading...</div>, // loading state
  errorComponent: () => <div>Error!</div>, // error state
});

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { packId1, packId2 } = Route.useSearch();
  const { packs } = Route.useLoaderData();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [currentDeckList, setCurrentDeckList] = useState("");

  const mixPacks = useCallback(() => {
    if (packs.length < 2) {
      console.warn("Not enough packs to mix.");
      return;
    }

    const randomIndex1 = Math.floor(Math.random() * packs.length);
    let randomIndex2 = Math.floor(Math.random() * packs.length);

    // ensure the random indices are different
    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(Math.random() * packs.length);
    }

    navigate({
      to: "/mixer",
      search: {
        packId1: packs[randomIndex1].meta.publicId,
        packId2: packs[randomIndex2].meta.publicId,
      },
      replace: true, // Replace the current history entry
    }).then();
  }, [packs, navigate]);

  // run mixPacks after render if no search params
  useEffect(() => {
    if (!(packId1 || packId2) && packs.length >= 2) {
      mixPacks();
    }
  }, [mixPacks, packId1, packId2, packs]);

  useEffect(() => {
    if (!packId1 || !packId2) return;

    // Find the packs that match the IDs from the search params
    const pack1 = packs.find((p) => p.meta.publicId === packId1);
    const pack2 = packs.find((p) => p.meta.publicId === packId2);

    // TODO: error handling if not found in packs
    if (!pack1 || !pack2) return;

    interface ClipboardCard {
      count: number;
      name: string;
      setCode: string;
      number: string;
    }

    const deckList: ClipboardCard[] = [];

    // TODO: handle different versions of cards with same name

    for (const cardDeck of pack1.data.mainBoard as CardDeck[]) {
      const existingCard = deckList.find((card) => card.name === cardDeck.name);
      if (existingCard) {
        existingCard.count += cardDeck.count;
      } else {
        deckList.push({
          count: cardDeck.count,
          name: cardDeck.name,
          setCode: cardDeck.setCode,
          number: cardDeck.number,
        });
      }
    }

    for (const cardDeck of pack2.data.mainBoard as CardDeck[]) {
      const existingCard = deckList.find((card) => card.name === cardDeck.name);
      if (existingCard) {
        existingCard.count += cardDeck.count;
      } else {
        deckList.push({
          count: cardDeck.count,
          name: cardDeck.name,
          setCode: cardDeck.setCode,
          number: cardDeck.number,
        });
      }
    }

    let deckListString = "";
    for (const card of deckList) {
      deckListString += `${card.count} ${card.name} (${card.setCode}) ${card.number}\n`;
    }

    setCurrentDeckList(deckListString);
  }, [packId1, packId2, packs]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentDeckList);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  if (!packId1 || !packId2) {
    return <div>Loading...</div>;
  }

  const pack1 = packs.find((p) => p.meta.publicId === packId1);
  const pack2 = packs.find((p) => p.meta.publicId === packId2);

  if (!pack1 || !pack2) {
    return <div>Packs not found</div>;
  }

  return (
    <>
      <h1 className="pb-8 text-3xl">Mixer</h1>
      <div className="mb-8 flex gap-4">
        <textarea
          ref={textAreaRef}
          className="hidden"
          defaultValue={currentDeckList}
        ></textarea>
        <Button size="sm" onClick={mixPacks} className="cursor-pointer">
          <Shuffle />
          Randomize Packs
        </Button>
        <Button size="sm" onClick={copyToClipboard} className="cursor-pointer">
          <Clipboard />
          Copy Decklist
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Pack pack={pack1?.data} publicId={packId1} />
        <Pack pack={pack2?.data} publicId={packId2} />
      </div>
    </>
  );
}
