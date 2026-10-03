import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";

import { FlipCard } from "@/components/flip-card.tsx";
import Footer from "@/components/footer.tsx";
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
          format first introduced by Wizards of the Coast in 2020. It offers a fun and accessible
          way to play varied games of Magic without the usual need for deck-building.
        </p>
        <p>
          Each Jumpstart booster pack contains 20 cards centered around a particular theme,
          including basic lands. Players simply take two packs each, shuffle them together, and
          start playing with the resulting 40-card decks.
        </p>
        <p>
          There are currently three mainline Jumpstart sets (
          <OutLink href={"https://mtg.wiki/page/Jumpstart_(2020)"}>Jumpstart</OutLink>,{" "}
          <OutLink href={"https://mtg.wiki/page/Jumpstart_2022"}>Jumpstart 2022</OutLink>, and{" "}
          <OutLink href={"https://mtg.wiki/page/Foundations_Jumpstart"}>
            Foundations Jumpstart
          </OutLink>
          ), as well as two more recent sets from{" "}
          <OutLink href={"https://mtg.wiki/page/Universes_Beyond"}>Universes Beyond</OutLink>. This
          application includes every possible pack from all of these for endless variety!
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
          Jumpstart Mixer quickly generates decklists for digital play, randomly combining two
          themed packs using parameters you control.
        </p>
        <div className="mb-4 rounded-xl bg-linear-to-r from-[oklch(from_var(--color-mtg-black)_calc(l+0.12)_calc(c+0.08)_h)] via-[oklch(from_var(--color-mtg-green)_calc(l+0.12)_calc(c+0.08)_h)] to-[oklch(from_var(--color-mtg-white)_calc(l+0.12)_calc(c+0.08)_h)] p-1">
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-card p-4">
            <div className="flex items-center gap-4">
              <p className="text-base text-muted-foreground">
                To start, try the{" "}
                <Link className="hyperlink" to={"/interactive"}>
                  Interactive
                </Link>{" "}
                page. Adjust the settings (if desired) to determine which themes could appear, then
                click on a booster to open it. Select a second pack to receive your final deck for
                export.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">Browse Themes</h3>
          <p className="text-base text-muted-foreground">
            Check out the{" "}
            <Link className="hyperlink" to={"/packs"}>
              Packs
            </Link>{" "}
            page to browse every available Jumpstart themed booster. Use the color filter, set
            filter, and search bars to narrow the list. Hover to see cards in the sidebar (if your
            screen is large enough for it to appear), or click on a pack&apos;s name for a closer
            look at its contents.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">Randomize</h3>
          <p className="text-base text-muted-foreground">
            Use the{" "}
            <Link className="hyperlink" to={"/mixer"} preload={false}>
              Mixer
            </Link>{" "}
            to quickly select two random themes, respecting the filters you have set at the top.
            It&apos;s a good fit if you need a lot of decks or want to examine many potential
            options. At the bottom of the page, you&apos;ll find images of all cards in the
            resulting deck.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <h3 className="mb-2 text-xl font-semibold">Export to Play</h3>
          <p className="text-base text-muted-foreground">
            After your combination is generated, there will be a button to copy the combined
            decklist to your clipboard. Paste this into{" "}
            <OutLink href="https://cockatrice.github.io/">Cockatrice</OutLink> or any other digital
            tabletop that supports Magic: The Gathering. Grab a friend to do the same and have fun
            playing!
          </p>
        </div>
      </div>
    </div>
  </section>
);

const AboutAppSection = () => (
  <section className="mb-16 border-t pt-16">
    <h3 className="mb-6 text-xl font-semibold">Technical Details</h3>
    <p className="max-w-[80ch] text-base leading-relaxed text-muted-foreground">
      Jumpstart Mixer is a <OutLink href="https://react.dev/">React</OutLink> application built with{" "}
      <OutLink href="https://www.typescriptlang.org/">TypeScript</OutLink> and{" "}
      <OutLink href="https://vite.dev/">Vite</OutLink>, utilizing{" "}
      <OutLink href="https://tanstack.com/router/">TanStack Router</OutLink>,{" "}
      <OutLink href="https://tanstack.com/query/">TanStack Query</OutLink>,{" "}
      <OutLink href="https://jotai.org/">Jotai</OutLink>,{" "}
      <OutLink href="https://tailwindcss.com/">Tailwind CSS</OutLink>, and{" "}
      <OutLink href="https://ui.shadcn.com/">shadcn/ui</OutLink>. Magic: The Gathering data was
      sourced from <OutLink href="https://mtgjson.com/">MTGJSON</OutLink>, and card imagery is
      fetched from <OutLink href="https://scryfall.com/">Scryfall</OutLink>. Jumpstart Mixer is
      designed to operate entirely in your browser from static files and{" "}
      <OutLink href="https://github.com/clearmoss/jumpstart-mixer">is open-source</OutLink>. It was
      developed by me, <OutLink href="https://clearmoss.com/">clearmoss</OutLink>.
    </p>
  </section>
);

function About() {
  return (
    <div className="mx-auto max-w-[100ch] px-2 py-8 sm:p-8 md:py-24">
      <WhatIsJumpstartSection />
      <HowToUseSection />
      <AboutAppSection />
      <Footer />
    </div>
  );
}
