import { createFileRoute, Link } from "@tanstack/react-router";
import OutLink from "@/components/out-link";
import gitHubLogo from "/github.svg";
import { FlipCard } from "@/components/flip-card.tsx";

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
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center md:p-8">
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
          Crack some virtual packs and jump into Magic: The Gathering with some
          friends!
        </p>

        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Explore Packs</h2>
            <p className="mb-4">
              Browse through themed Jumpstart packs. Filter by color, set, or
              even search for specific cards.
            </p>
            <Link to="/packs" className="hyperlink">
              View all packs →
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Shuffle Up</h2>
            <p className="mb-4">
              Combine two random packs to create a 40-card deck, then export the
              decklist to your clipboard.
            </p>
            <Link to="/mixer" className="hyperlink">
              Start mixing →
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Learn More</h2>
            <p className="mb-4">
              New to Jumpstart? Learn more about this exciting Magic format and
              how to best use this app.
            </p>
            <Link to="/about" className="hyperlink">
              About Jumpstart →
            </Link>
          </div>
        </div>

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
          <p className="mt-4 flex justify-center">
            <OutLink
              href="https://github.com/clearmoss/jumpstart-mixer"
              className="flex items-center"
            >
              <img
                src={gitHubLogo}
                alt="GitHub"
                className="inline-block h-5 pr-2"
              />{" "}
              <span>View source on GitHub</span>
            </OutLink>
          </p>
        </footer>
      </div>
    </div>
  );
}
