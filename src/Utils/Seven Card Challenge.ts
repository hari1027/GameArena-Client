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

export interface SevenCard {
  suit: Suit;   
  rank: Rank;   
}

export type PlayersHands = Record<string, SevenCard[]>;

export interface SevenCardChallengeGameDetails {
  round: number;
  circleCount: number;
  players: PlayerSummary[];
  playersHands : PlayersHands
  turn: string | undefined;
  discardTop: SevenCard[] | [];
  deckCount: number;
  jokerRankOfTheRound : SevenCard | null;
  message: string;
}

export interface PlayerSummary {
  id: string;
  handCount: number;
  roundPoints: number;
  totalPoints: number;
}

