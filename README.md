# Jumpstart Mixer

Crack some packs and jump into Magic: The Gathering with your friends! Jumpstart Mixer quickly generates 40-card decklists by combining two random Jumpstart boosters, intended for use with virtual tabletop software like [Cockatrice](https://cockatrice.github.io/).

[Try Jumpstart Mixer here](https://jumpstart.clearmoss.com/).

<img width="2000" alt="Jumpstart Mixer Screenshot" src="https://github.com/user-attachments/assets/662e5a09-cde3-4563-ba42-0129ce27bee3" />

## Features

- **Interactive mode:** Open virtual booster packs with smooth animations.
- **Endless variety:** 480 booster packs, with every mainline Jumpstart set and the two most recent ones from Universes Beyond included.
- **Browse packs:** Search by theme or card name, filter by set or color identity, and inspect each pack’s contents.
- **Mixer page:** Rapidly generate decks based on your filters and examine each card inside. Revisit or share a combination with a stable URL.
- **Easy export:** Whenever a combination is generated, copy the resulting decklist to your clipboard with one click. Use in your favorite digital tabletop, such as [Cockatrice](https://cockatrice.github.io/).

## Running locally

First, clone the repository with git. Make sure [pnpm](https://pnpm.io/) is installed, and then run these commands in the `jumpstart-mixer` directory:

```sh
pnpm install
pnpm build
pnpm preview
```

You'll then see the local URL where you can access the app running on your machine.

## More details

Jumpstart Mixer is built with React, TypeScript, Vite, TanStack Router and Query, Jotai, shadcn/ui, and Tailwind CSS. The entire application and its data are served as static files which operate in the browser, so there is no backend server.

This project is licensed under the [MIT License](LICENSE).

Jumpstart Mixer is an unofficial fan project. Magic: The Gathering is a trademark of [Wizards of the Coast](https://company.wizards.com/). Pack data is sourced from [MTGJSON](https://mtgjson.com/), and card imagery is provided by [Scryfall](https://scryfall.com/).
