// TicketToRide.ts
// TypeScript type definitions for the Ticket to Ride India 1911 game snapshot.

// ─── Card colors ─────────────────────────────────────────────────────────────
export type CardColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "black"
  | "white"
  | "pink"
  | "orange"
  | "locomotive";

// ─── A single color/train card ────────────────────────────────────────────────
export interface TrainCard {
  color: CardColor;
}

// ─── A destination ticket ─────────────────────────────────────────────────────
export interface Ticket {
  id:     string;
  from:   string;
  to:     string;
  points: number;
}

// ─── A ticket with end-of-game result attached ────────────────────────────────
export interface TicketResult extends Ticket {
  completed: boolean;
  delta:     number; // +points if completed, -points if not
}

// ─── A route on the board ─────────────────────────────────────────────────────
export interface Route {
  id:             string;
  from:           string;
  to:             string;
  color:          CardColor | "gray";
  length:         number;
  ferry:          boolean;
  locosRequired?: number;       // only present when ferry === true
  dualGroup?:     string;       // only present for dual-lane routes
  claimedBy:      string | null;
  trainColor:     string | null; // hex — player's train color, null if unclaimed
}

// ─── Per-player data in the snapshot ─────────────────────────────────────────
export interface TTRPlayerSnapshot {
  id:                   string;
  trainColor:           string; // hex assigned at game start
  hand:                 TrainCard[];
  handCount:            number;
  tickets:              Ticket[];
  pendingTickets:       Ticket[];      // drawn but not yet confirmed
  claimedRouteIds:      string[];
  score:                number;
  trainsLeft:           number;
  initialSelectionDone: boolean;
  ticketResults:        TicketResult[] | null; // null until game_over
}

// ─── Final scores entry ───────────────────────────────────────────────────────
export interface TTRFinalScore {
  playerId:      string;
  trainColor:    string | null;
  score:         number;
  buildScore:    number;
  ticketResults: TicketResult[];
}

// ─── Game phases ──────────────────────────────────────────────────────────────
export type TTRPhase =
  | "waiting"
  | "initial_selection"
  | "playing"
  | "game_over";

// ─── Full game snapshot (emitted as ticket_game_state) ────────────────────────
export interface TicketToRideGameDetails {
  map:                        "India 1911";
  phase:                      TTRPhase;
  initialSelectionSecondsLeft: number;
  players:                    TTRPlayerSnapshot[];
  currentTurn:                string | null;
  deckCount:                  number;
  discardCount:               number;
  ticketDeckCount:            number;
  ticketDiscardCount:         number;
  faceUpCards:                TrainCard[];
  routes:                     Route[];
  finalRound:                 boolean;
  lastRoundCalledBy:          string | null;
  finalScores:                TTRFinalScore[] | null;
  message:                    string;
}