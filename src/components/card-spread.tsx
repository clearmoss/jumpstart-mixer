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

type SortedPackCardsProps = {
  pack: Deck;
  packIndex: number;
};

type CardSpreadProps = {
  packs: (Deck | undefined)[] | undefined;
};

function SortedPackCards({ pack, packIndex }: SortedPackCardsProps) {
  const cardGroups = useCardGrouping(pack);

  return cardGroups.flatMap((group) =>
    group.cards.flatMap((card) =>
      Array.from({ length: card.count }, (_, copyIndex) => (
        <CardImage key={`${packIndex}-${card.uuid}-${copyIndex}`} card={card} />
      )),
    ),
  );
}

function CardSpread({ packs }: CardSpreadProps) {
  const validPacks = packs?.filter((p): p is Deck => Boolean(p));

  if (!validPacks || validPacks.length === 0) {
    return "No cards to display.";
  }

  return (
    <Card className="m-0 p-0">
      <Accordion
        className="px-6 py-4"
        type="single"
        defaultValue="card-spread"
        collapsible
      >
        <AccordionItem value="card-spread">
          <AccordionTrigger className="text-md cursor-pointer font-bold">
            Card Spread
          </AccordionTrigger>
          <AccordionContent className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[128rem]:grid-cols-5">
            {validPacks.map((pack, packIndex) => (
              <SortedPackCards
                key={`${pack.name}-${packIndex}`}
                pack={pack}
                packIndex={packIndex}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
export default CardSpread;
