import { createFileRoute, Link } from "@tanstack/react-router";
import OutLink from "@/components/out-link.tsx";
import { FlipCard } from "@/components/flip-card.tsx";
import gitHubLogo from "/github.svg";
import React from "react";

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

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-6 bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
    {children}
  </h2>
);

const WhatIsJumpstartSection = () => (
  <section className="mb-20">
    <SectionHeading>What is Jumpstart?</SectionHeading>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <p>
          Jumpstart is a{" "}
          <OutLink href="https://en.wikipedia.org/wiki/Magic:_The_Gathering">
            Magic: The Gathering
          </OutLink>{" "}
          format first introduced by Wizards of the Coast in 2020. It offers a
          fun and accessible way to play varied games of Magic without the usual
          need for deck-building.
        </p>
        <p>
          Each Jumpstart booster pack contains 20 cards centered around a
          particular theme. Players simply take two packs each, shuffle them
          together, and start playing with the resulting 40-card decks.
        </p>
        <p>
          There are currently three main Jumpstart sets:{" "}
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
          . This application includes every possible pack from all three for
          endless variety!
        </p>
      </div>
      <div className="flex items-center justify-center">
        <FlipCard
          backImg="/back.jpg"
          frontImg="https://cards.scryfall.io/large/front/8/0/80c5226d-1b6b-4bc9-9aaf-56eaf728a47c.jpg"
          size={200}
        />
      </div>
    </div>
  </section>
);

const HowToUseSection = () => (
  <section className="mb-20">
    <SectionHeading>How do I use this app?</SectionHeading>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <p>
          Jumpstart Mixer makes it easy to generate decklists for digital play,
          randomly combining two themed packs using parameters you control.
        </p>
        <div className="bg-card rounded-xl border p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">1. Browse Themes</h3>
          <p className="text-muted-foreground text-base">
            Check out the{" "}
            <Link className="hyperlink" to={"/packs"}>
              Packs
            </Link>{" "}
            page to browse every available Jumpstart themed booster. Use the
            color/set filters and search bars at the top to narrow the list.
            Hover to see cards in the sidebar (if your screen is large enough
            for it to appear), or click a pack for a closer look.
          </p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">2. Randomize</h3>
          <p className="text-muted-foreground text-base">
            Use the{" "}
            <Link className="hyperlink" to={"/mixer"}>
              Mixer
            </Link>{" "}
            to randomly select two themes, respecting the filters you have set
            at the top. You'll find images of all cards in the resulting deck at
            the bottom.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">3. Export to Play</h3>
          <p className="text-muted-foreground text-base">
            Use the button to copy your combined decklist and paste it into{" "}
            <OutLink href="https://cockatrice.github.io/">Cockatrice</OutLink>,{" "}
            or any other digital tabletop which supports Magic: The Gathering.
            Grab a friend to do the same and have fun!
          </p>
        </div>
      </div>
    </div>
  </section>
);

const AboutAppSection = () => (
  <section className="mb-16 border-t pt-16">
    <h3 className="mb-6 text-xl font-semibold">Technical Details</h3>
    <p className="text-muted-foreground max-w-[80ch] text-base leading-relaxed">
      Jumpstart Mixer is a <OutLink href="https://react.dev/">React</OutLink>{" "}
      frontend built with{" "}
      <OutLink href="https://www.typescriptlang.org/">TypeScript</OutLink> and{" "}
      <OutLink href="https://vitejs.dev/">Vite</OutLink>, utilizing{" "}
      <OutLink href="https://tanstack.com/router/">TanStack Router</OutLink>,{" "}
      <OutLink href="https://tanstack.com/query/">TanStack Query</OutLink>,{" "}
      <OutLink href="https://jotai.org/">Jotai</OutLink>,{" "}
      <OutLink href="https://tailwindcss.com/">Tailwind CSS</OutLink>, and{" "}
      <OutLink href="https://ui.shadcn.com/">shadcn/ui</OutLink>. Magic: The
      Gathering data was sourced from{" "}
      <OutLink href="https://mtgjson.com/">MTGJSON</OutLink>, and card imagery
      is fetched from <OutLink href="https://scryfall.com/">Scryfall</OutLink>.
      Jumpstart Mixer is designed to operate entirely in your browser from
      static files and{" "}
      <OutLink href="https://github.com/clearmoss/jumpstart-mixer">
        is open-source
      </OutLink>
      . It was developed by me,{" "}
      <OutLink href="https://clearmoss.com/">clearmoss</OutLink>.
    </p>
  </section>
);

function About() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[100ch] px-6 py-12 md:py-24">
        <WhatIsJumpstartSection />
        <HowToUseSection />
        <AboutAppSection />

        <footer className="text-muted-foreground mt-24 border-t pt-8 text-center text-xs">
          <p>
            Jumpstart Mixer is an unofficial project. Magic: The Gathering is a
            trademark of
            <OutLink href="https://company.wizards.com/">
              {" "}
              Wizards of the Coast
            </OutLink>
            .
          </p>
          <div className="mt-6 flex justify-center">
            <OutLink
              href="https://github.com/clearmoss/jumpstart-mixer"
              className="hover:text-foreground flex items-center transition-colors"
            >
              <img
                src={gitHubLogo}
                alt="GitHub"
                className="inline-block h-4 pr-2 opacity-70"
              />
              <span>Source code</span>
            </OutLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
