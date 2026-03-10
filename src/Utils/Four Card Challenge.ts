export type Suit =
  | "spade"
  | "club"
  | "diamond"
  | "heart"
  | "joker";

export type Rank =
  | "A"
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
  | "joker";

export interface FourCard {
  suit: Suit;   
  rank: Rank;   
}

export type PlayersHands = Record<string, FourCard[]>;

export interface FourCardChallengeGameDetails {
  round: number;
  circleCount: number;
  players: PlayerSummary[];
  playersHands : PlayersHands
  turn: string | undefined;
  discardTop: FourCard | null;
  deckCount: number;
  message: string;
}

export interface PlayerSummary {
  id: string;
  handCount: number;
  roundPoints: number;
  totalPoints: number;
}

