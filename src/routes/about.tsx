import { createFileRoute, Link } from "@tanstack/react-router";
import OutLink from "@/components/out-link.tsx";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About Jumpstart",
      },
    ],
  }),
  component: About,
});

const WhatIsJumpstartSection = () => (
  <div className="mb-16">
    <h2 className="mb-4 text-2xl font-semibold">What is Jumpstart?</h2>
    <p className="mb-4">
      Jumpstart is a{" "}
      <OutLink href="https://en.wikipedia.org/wiki/Magic:_The_Gathering">
        Magic: The Gathering
      </OutLink>{" "}
      format first introduced by Wizards of the Coast in 2020. It offers a fun
      and accessible way to play games of Magic without the usual need for
      deck-building. There are currently three main Jumpstart sets:{" "}
      <OutLink href={"https://mtg.fandom.com/wiki/Jumpstart"}>
        Jumpstart
      </OutLink>
      ,{" "}
      <OutLink href={"https://mtg.fandom.com/wiki/Jumpstart_2022"}>
        Jumpstart 2022
      </OutLink>
      , and{" "}
      <OutLink href={"https://mtg.fandom.com/wiki/Foundations_Jumpstart"}>
        Foundations Jumpstart
      </OutLink>
      .
    </p>
    <p className="mb-4">
      Each booster pack of Jumpstart contains 20 cards centered around a
      particular theme, with lands already included. Players simply take two
      Jumpstart packs each, shuffle them together, and then start playing with
      the resulting 40-card decks. Most of the themes have multiple variants
      that tweak the included cards, resulting in those packs being more common
      to open (while also providing variety within each theme). The few themes
      left over with only a single variant are thus more rare to find.
    </p>
    <p className="mb-4">
      Jumpstart is perfect for players new to Magic, those seeking casual play
      sessions with unpredictable cards, or anyone simply looking for a quick
      format with minimal setup. The vast amount of possible deck permutations
      and their resulting matchups always make it an exciting way to play!
    </p>
  </div>
);

const HowToUseSection = () => (
  <div className="mb-16">
    <h2 className="mb-4 text-2xl font-semibold">How do I use this app?</h2>
    <p className="mb-4">
      Jumpstart Mixer helps you explore the different pack themes and randomly
      generate decklists from them, just as if you were opening two new
      boosters.
    </p>
    <p className="mb-4">
      On the{" "}
      <Link className="hyperlink" to={"/packs"}>
        Packs page
      </Link>
      , you can browse through the available Jumpstart packs. You can also
      filter them by color, set, or search for specific cards. Hover over a pack
      to see its contents in the sidebar, and then hover over a card name to see
      its image. Each pack has a button to copy its individual decklist to your
      clipboard, and another button to mix it with a second random pack.
    </p>
    <p className="mb-4">
      That brings us to the{" "}
      <Link className="hyperlink" to={"/mixer"}>
        Mixer page
      </Link>
      , where two packs are combined. There's a randomize button, which will
      select two random packs based on your current filter settings. Once you
      have two packs you're happy with, you can copy the combined decklist to
      your clipboard. You can also inspect all the cards in the resulting deck
      by scrolling down to the Card Spread section.
    </p>
    <p className="mb-4">
      Use your copied decklist in an application like{" "}
      <OutLink href="https://cockatrice.github.io/">Cockatrice</OutLink> to play
      Jumpstart with others!
    </p>
  </div>
);

const AboutAppSection = () => (
  <div className="mb-16">
    <h2 className="mb-4 text-2xl font-semibold">How was this app made?</h2>
    <p className="mb-4">
      Jumpstart Mixer is a <OutLink href="https://react.dev/">React</OutLink>{" "}
      frontend built with{" "}
      <OutLink href="https://www.typescriptlang.org/">TypeScript</OutLink> and{" "}
      <OutLink href="https://vitejs.dev/">Vite</OutLink>, utilizing{" "}
      <OutLink href="https://tanstack.com/router/">TanStack Router</OutLink>,{" "}
      <OutLink href="https://tanstack.com/query/">TanStack Query</OutLink>,{" "}
      <OutLink href="https://jotai.org/">Jotai</OutLink>,{" "}
      <OutLink href="https://tailwindcss.com/">Tailwind CSS</OutLink>, and{" "}
      <OutLink href="https://ui.shadcn.com/">shadcn/ui</OutLink>. Data
      concerning Magic: The Gathering was sourced from{" "}
      <OutLink href="https://mtgjson.com/">MTGJSON</OutLink>, and card imagery
      is fetched from <OutLink href="https://scryfall.com/">Scryfall</OutLink>.
      Jumpstart Mixer is designed to operate entirely in your browser from
      static files and{" "}
      <OutLink href="https://github.com/clearmoss/jumpstart-mixer">
        the source code is available on GitHub
      </OutLink>
      . It was developed by me,{" "}
      <OutLink href="https://clearmoss.com/">clearmoss</OutLink>.
    </p>
  </div>
);

function About() {
  return (
    <div className="flex w-full">
      <div className="mx-auto flex w-full max-w-[70ch] flex-col p-4 text-xl leading-[145%] md:p-8">
        <WhatIsJumpstartSection />
        <HowToUseSection />
        <AboutAppSection />
        <footer className="text-muted-foreground mt-16 text-sm">
          <p>
            Jumpstart Mixer is an unofficial project. Magic: The Gathering is a
            trademark of
            <OutLink href="https://company.wizards.com/">
              {" "}
              Wizards of the Coast
            </OutLink>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
