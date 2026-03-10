import { Gamepad, type LucideIcon } from "lucide-react";

export interface Game {
  name: string;
  icon: LucideIcon;
  min_players: number;
  max_players: number;
  is_only_even_players_required: boolean;
}

export const games: Game[] = [
  {
    name: "Five Alive",
    icon: Gamepad,
    min_players: 2,
    max_players: 5,
    is_only_even_players_required: false,
  },
  {
    name: "Four Card Challenge",
    icon: Gamepad,
    min_players: 2,
    max_players: 12,
    is_only_even_players_required: false,
  },
  {
    name: "Seven Card Challenge",
    icon: Gamepad,
    min_players: 2,
    max_players: 12,
    is_only_even_players_required: false,
  },
   {
    name: "Ace",
    icon: Gamepad,
    min_players: 2,
    max_players: 8,
    is_only_even_players_required: false,
  },
];

export interface GameWithoutIcon {
  name: string;
  icon?: LucideIcon;
  min_players: number;
  max_players: number;
  is_only_even_players_required: boolean;
}
