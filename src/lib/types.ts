export type AppTheme = "light" | "dark";

export type CardDeck = {
  colorIdentity: string[];
  count: number;
  identifiers: { scryfallId?: string };
  imageUri?: string; // used for synthesized theme cards
  name: string;
  number: string;
  rarity: string;
  setCode: string;
  type: string;
  uuid: string;
};

export type CardPreview = Pick<CardDeck, "name"> &
  Partial<Pick<CardDeck, "identifiers" | "imageUri" | "rarity" | "setCode" | "uuid">>;

export type Deck = {
  code: string;
  mainBoard: CardDeck[];
  name: string;
};

export type PackMeta = {
  publicId: string;
  themeCardUri?: string;
};

export type PackFile = {
  meta: PackMeta;
  data: Deck;
};

export type PackIndexData = {
  publicId: string;
  url: string;
};

export type PackIndex = {
  packs: PackIndexData[];
  sets: string[];
};

export type SetMetadata = {
  code: string;
  name: string;
  releaseDate: string;
};

export type ClipboardCard = {
  count: number;
  name: string;
  setCode: string;
  number: string;
};
