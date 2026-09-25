import gitHubLogo from "/github.svg";
import { createFileRoute, Link } from "@tanstack/react-router";

import { FlipCard } from "@/components/flip-card.tsx";
import OutLink from "@/components/out-link";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

export const Route = createFileRoute("/")({
  head: () => {
    return {
      meta: [
        {
          title: "Jumpstart Mixer",
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-2 text-center sm:p-8">
      <div className="mt-8 mb-16 flex gap-16">
        <FlipCard
          backImg="/back.jpg"
          frontImg="https://cards.scryfall.io/large/front/1/6/169fe84f-335f-431b-b905-529ca77c6ba1.jpg"
          delay={200}
          size={200}
          className="hidden lg:block"
        />{" "}
        <FlipCard
          backImg="/back.jpg"
          frontImg="https://cards.scryfall.io/large/front/2/9/29446afc-dbb0-4884-9f17-074d625a0c56.jpg"
          delay={500}
          size={200}
        />{" "}
        <FlipCard
          backImg="/back.jpg"
          frontImg="https://cards.scryfall.io/large/front/f/9/f9dfae63-8cbd-48ec-981c-e0b9bbcbe11f.jpg"
          delay={800}
          size={200}
          className="hidden lg:block"
        />
      </div>
      <div className="mx-auto max-w-[90ch]">
        <h1 className="mb-4 bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
          Jumpstart Mixer
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
          Crack some packs and jump into Magic: The Gathering with your friends.
        </p>

        <div className="mb-4 rounded-xl bg-linear-to-r from-[oklch(from_var(--color-mtg-black)_calc(l+0.12)_calc(c+0.08)_h)] via-[oklch(from_var(--color-mtg-green)_calc(l+0.12)_calc(c+0.08)_h)] to-[oklch(from_var(--color-mtg-white)_calc(l+0.12)_calc(c+0.08)_h)] p-1">
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-card p-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-linear-to-r from-orange-600 to-orange-400 px-2 py-1 text-xs text-white uppercase">
                new
              </Badge>
              <p className="">Add suspense by opening virtual packs!</p>
            </div>
            <Button variant="mtg-green" className="p-4">
              <Link to="/interactive" className="text-lg text-white">
                Try Interactive Mode →
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Explore Packs</h2>
            <p className="mb-4">
              Browse every themed Jumpstart pack. Filter by color, set, or even search for specific
              cards.
            </p>
            <Link to="/packs" className="hyperlink">
              View all packs →
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Shuffle Up</h2>
            <p className="mb-4">
              Combine two random packs to create a 40-card deck, then export the decklist to your
              clipboard.
            </p>
            <Link to="/mixer" preload={false} className="hyperlink">
              Start mixing →
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Learn More</h2>
            <p className="mb-4">
              New to Jumpstart? Learn more about this exciting Magic format and how to best use this
              app.
            </p>
            <Link to="/about" className="hyperlink">
              About Jumpstart →
            </Link>
          </div>
        </div>
        <footer className="mt-24 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            Jumpstart Mixer is an unofficial project. Magic: The Gathering is a trademark of
            <OutLink href="https://company.wizards.com/"> Wizards of the Coast</OutLink>.
          </p>
          <div className="mt-6 flex justify-center">
            <OutLink
              href="https://github.com/clearmoss/jumpstart-mixer"
              className="flex items-center"
            >
              <Badge variant="default" className="bg-white p-4 text-black outline">
                <img src={gitHubLogo} alt="GitHub" className="inline-block h-5 pr-2" />{" "}
                <span>View source on GitHub</span>
              </Badge>
            </OutLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
