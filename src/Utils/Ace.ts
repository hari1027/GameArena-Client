export type Suit =
  | "spade"
  | "club"
  | "diamond"
  | "heart";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Ace {
  suit: Suit;   
  rank: Rank;   
}

export interface AceGameDetails {
  players: PlayerSummary[];
  cardsList: CardsList[];
  currentTurn: string;
  roundSuit: string | null;
  roundCards: RoundCards[] | []
  message: string;
}

export interface PlayerSummary {
  username: string;
  cardsCount: number;
}

export interface CardsList {
  username: string;
  cards: Ace[]
}

export interface RoundCards {
  playerId: string;
  card: Ace;
}
