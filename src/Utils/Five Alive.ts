 export const GameCards = [
    { type: "0", displayValue: "0", label: "0", actualValue: 0 },
    { type: "1", displayValue: "1", label: "1", actualValue: 1 },
    { type: "2", displayValue: "2", label: "2", actualValue: 2 },
    { type: "3", displayValue: "3", label: "3", actualValue: 3 },
    { type: "4", displayValue: "4", label: "4", actualValue: 4 },
    { type: "5", displayValue: "5", label: "5", actualValue: 5 },
    { type: "6", displayValue: "6", label: "6", actualValue: 6 },
    { type: "7", displayValue: "7", label: "7", actualValue: 7 },
    { type: "plus-one", displayValue: "+1", label: "", actualValue: 'plus1' },
    { type: "pass-me-by", displayValue: "🏃", label: "Pass Me By", actualValue: 'pass' },
    { type: "skip", displayValue: "🚫", label: "Skip", actualValue: 'skip' },
    { type: "reverse", displayValue: "🔁", label: "Reverse", actualValue: 'reverse' },
    { type: "plus-two", displayValue: "+2", label: "", actualValue: 'plus2' },
    { type: "bomb", displayValue: "💣", label: "Bomb", actualValue: 'bomb' },
    { type: "shuffle", displayValue: "🌀", label: "Shuffle", actualValue: 'shuffle' },
    { type: "equal-to-10", displayValue: "=10", label: "", actualValue: 'eq10' },
    { type: "equal-to-21", displayValue: "=21", label: "", actualValue: 'eq21' },
    { type: "equal-to-0", displayValue: "=0", label: "", actualValue: 'eq0' }
  ];

  export interface FiveAliveGameDetails {
  players: PlayerSummary[];
  cardsList: PlayerCards[];
  score: number;
  currentTurn: string;
  deckCount: number;
  discardCount: number;
  message: string;
  lastDiscardedCard : string | number | null
}

export interface PlayerSummary {
  username: string;
  lives: number;
  cardsCount: number;
}

export interface PlayerCards {
  username: string;
  cards: Card[];
}

export type Card = NumberCard | PowerCard;

export interface NumberCard {
  type: "number";
  value: number;
}

export interface PowerCard {
  type: "power";
  power:
    | "bomb"
    | "skip"
    | "reverse"
    | "eq21"
    | "plus2"
    | "pass"
    | "eq10"
    | "eq0";
}
