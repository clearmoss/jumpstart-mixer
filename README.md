# Jumpstart Mixer

Vite/React frontend application for generating Magic: The Gathering decklists which combine two random Jumpstart packs, intended for use with virtual tabletop software like [Cockatrice](https://cockatrice.github.io/).

You can find a deployed version of this app here: https://jumpstart.clearmoss.com/

## Features
- Contains every booster pack from the three main Jumpstart sets (363 unique boosters)
- Browse themed packs with a sidebar (on wide screens only) for viewing the cards inside
- Filter packs by set and/or color identity
- Dynamic search by pack title, or by card names inside the pack
- "Mixer" page that selects two random packs within the selected filters
- One-click copy of the combined decklist to clipboard
- Functions locally in the browser from static files (without a backend server)
- Clean UI with a responsive layout for mobile and desktop

Jumpstart Mixer is an unofficial fan project. Magic: The Gathering is a trademark of [Wizards of the Coast](https://company.wizards.com/). Data was sourced from [MTGJSON](https://mtgjson.com/) and card imagery is dynamically fetched from [Scryfall](https://scryfall.com/).

## Screenshot

<img width="1560" height="1466" alt="jumpstart-mixer-screenshot" src="https://github.com/user-attachments/assets/e6ed89b4-013e-4b50-911e-004e2fbd426c" />
