import type { Deck } from "@/lib/types.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { CardImage } from "@/components/card-image.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useCardGrouping } from "@/hooks/use-card-grouping.ts";
import { useSetAtom } from "jotai";
import { currentSidebarCardAtom } from "@/lib/atoms.ts";
import { LayoutGrid } from "lucide-react";

type SortedPackCardsProps = {
  pack: Deck;
  instanceId: string;
};

type CardSpreadProps = {
  packs: (Deck | undefined)[] | undefined;
  packIds: (string | undefined)[] | undefined;
};

function SortedPackCards({ pack, instanceId }: SortedPackCardsProps) {
  const cardGroups = useCardGrouping(pack);
  const setCurrentSidebarCard = useSetAtom(currentSidebarCardAtom);

  return cardGroups.flatMap((group) =>
    group.cards.flatMap((card) =>
      Array.from({ length: card.count }, (_, copyIndex) => (
        <CardImage
          key={`${instanceId}-${card.uuid}-${copyIndex}`}
          card={card}
          onMouseEnter={() => setCurrentSidebarCard(card)}
        />
      )),
    ),
  );
}

function CardSpread({ packs, packIds }: CardSpreadProps) {
  const validPacksWithIds = packs
    ?.map((pack, index) => ({
      pack,
      packId: packIds?.[index],
      instanceId: `${packIds?.[index]}-${index}`,
    }))
    .filter(
      (item): item is { pack: Deck; packId: string; instanceId: string } =>
        Boolean(item.pack) && Boolean(item.packId),
    );

  if (!validPacksWithIds || validPacksWithIds.length === 0) {
    return "No cards to display.";
  }

  return (
    <Card className="m-0 p-0">
      <Accordion
        className="px-4 py-4 sm:px-6"
        type="single"
        defaultValue="card-spread"
        collapsible
      >
        <AccordionItem value="card-spread">
          <AccordionTrigger className="flex cursor-pointer items-center gap-2 p-0 hover:no-underline">
            <LayoutGrid size={20} className="text-muted-foreground" />
            Card Spread
          </AccordionTrigger>
          <AccordionContent className="xs:grid-cols-2 grid grid-cols-1 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[128rem]:grid-cols-5">
            {validPacksWithIds.map(({ pack, instanceId }) => (
              <SortedPackCards
                key={instanceId}
                pack={pack}
                instanceId={instanceId}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
export default CardSpread;
