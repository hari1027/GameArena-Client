/* eslint-disable react-hooks/refs */

import {
  Moon,
  Sun,
  LogOut,
  Book,
  House,
  PlusCircle,
  Mic,
  MicOff,
} from "lucide-react";
import "./dashboard.css";
import { Tooltip, Fade } from "@mui/material";
import { games, type GameWithoutIcon } from "../Utils/GamesDetail";
import type z from "zod";
import JoinRoomModal from "./JoinRoomModal";
import RoomLobby from "./RoomLobby";
import OnlineRoomsView from "./OnlineRoomsView";
import type {
  change_game_Schema,
  join_room_Schema,
  Room,
} from "../Utils/LobbyDetails";
import type { SnackbarHandle } from "../GlobalSnackbar";
import GlobalSnackbar from "../GlobalSnackbar";
import type { FiveAliveGameDetails } from "../Utils/Five Alive";
import FiveAlive from "./FiveAlive/FiveAlive";
import type { FourCardChallengeGameDetails } from "../Utils/Four Card Challenge";
import FourCardChallenge from "./FourCardChallenge/FourCardChallenge";
import type { SevenCardChallengeGameDetails } from "../Utils/Seven Card Challenge";
import SevenCardChallenge from "./SevenCardChallenge/SevenCardChallenge";
import type { AceGameDetails } from "../Utils/Ace";
import Ace from "./Ace/Ace";
import type { TicketToRideGameDetails } from "../Utils/Ticket To Ride";
import TicketToRide from "./TicketToRide/TicketToRide";
import RulesModal from "./RulesModal";

interface DashboardUIProps {
  user: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;

  // room
  roomDetails: Room | null;
  isHost: boolean;

  // audio (from Dashboard via context)
  showMic: boolean;
  isMicMuted: boolean;
  onToggleMic: () => void;

  // views
  onlineRoomsView: boolean;
  selectedOnlineGame: GameWithoutIcon | null;

  // modals
  isJoinRoomModalOpen: boolean;
  isRulesModalOpen: boolean;
  setIsJoinRoomModalOpen: (v: boolean) => void;
  setIsRulesOpen: (v: boolean) => void;

  // actions
  localJoinRoom: (data: z.infer<typeof join_room_Schema>) => void;
  localCreateRoom: (
    username: string,
    gamename: string,
    type: string,
    minPlayers: number,
    maxPlayers: number,
    isEvenPlayersReq: boolean,
  ) => void;
  localLeaveRoom: () => void;
  localDeleteRoom: () => void;
  localKickPlayer: (username: string) => void;
  localChangeGameType: (roomId: string) => void;
  localChangeGameName: (data: z.infer<typeof change_game_Schema>) => void;
  localStartGame: () => void

  // online view
  setOnlineRoomsView: (v: boolean) => void;
  setSelectedOnlineGame: (g: GameWithoutIcon | null) => void;

  snackbarRef: React.RefObject<SnackbarHandle | null> ;

  //game screen

  gameStarted: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  fiveAliveGameDetails : FiveAliveGameDetails | null;
  fourCardChallengeGameDetails : FourCardChallengeGameDetails | null;
  sevenCardChallengeGameDetails : SevenCardChallengeGameDetails | null;
  aceGameDetails : AceGameDetails | null;
  ticketToRideGameDetails : TicketToRideGameDetails | null
}

const DashboardUI = ({
  user,
  isDarkMode,
  toggleTheme,
  onLogout,
  roomDetails,
  isHost,
  showMic,
  isMicMuted,
  onToggleMic,
  onlineRoomsView,
  selectedOnlineGame,
  isJoinRoomModalOpen,
  isRulesModalOpen,
  setIsJoinRoomModalOpen,
  setIsRulesOpen,
  localJoinRoom,
  localCreateRoom,
  localLeaveRoom,
  localDeleteRoom,
  localKickPlayer,
  localChangeGameType,
  localChangeGameName,
  localStartGame,
  setOnlineRoomsView,
  setSelectedOnlineGame,
  snackbarRef,
  gameStarted,
  socketState,
  fiveAliveGameDetails,
  fourCardChallengeGameDetails,
  sevenCardChallengeGameDetails,
  aceGameDetails,
  ticketToRideGameDetails,
}: DashboardUIProps) => {
  return (
    <div className="app-container">
      
      {/* TOP BAR */}

      <nav className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <House color="var(--primary-accent)" />
          <span style={{ fontWeight: 900 }}>GAMES ARENA</span>
        </div>

        <div style={{ display: "flex", gap: "10px", marginLeft:"10px" }}>
          {showMic && (
            <Tooltip
              title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              arrow
              TransitionComponent={Fade}
            >
              <button className="icon-btn" onClick={onToggleMic}>
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </Tooltip>
          )}

          {roomDetails === null && !onlineRoomsView && (
            <Tooltip title="Join Room" arrow TransitionComponent={Fade}>
              <button
                className="icon-btn"
                onClick={() => setIsJoinRoomModalOpen(true)}
              >
                <PlusCircle size={24} />
              </button>
            </Tooltip>
          )}

          <Tooltip
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            arrow
            TransitionComponent={Fade}
          >
            <button className="icon-btn" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </Tooltip>

          <Tooltip title="Rules" arrow TransitionComponent={Fade}>
            <button
              className="icon-btn"
              onClick={() => setIsRulesOpen(!isRulesModalOpen)}
            >
              <Book size={24} />
            </button>
          </Tooltip>
          
          {roomDetails === null &&
          <Tooltip title="Logout" arrow TransitionComponent={Fade}>
            <button className="icon-btn" onClick={onLogout}>
              <LogOut size={24} />
            </button>
          </Tooltip>
          }
        </div>
      </nav>

      {/* DASHBOARD */}

      {roomDetails === null && !onlineRoomsView && (
        <main className="dashboard-main">
          <h2 className="dashboard-title">Pick Your Game</h2>

          <div className="game-grid">
            {games.map((game, i) => {
              const Icon = game.icon;
              return (
                <div key={i} className="game-card">
                   <div style={{ color: "var(--primary-accent)" }}>
                         <Icon />
                    </div>
                  <h3>{game.name}</h3>

                  <div className="game-actions">
                    <button
                      className="play-button-1"
                      onClick={() => {
                        setOnlineRoomsView(true);
                        setSelectedOnlineGame(game);
                      }}
                    >
                      Play Online
                    </button>

                    <button
                      className="play-button-2"
                      onClick={() =>
                        localCreateRoom(
                          user,
                          game.name,
                          "Play With Mates",
                          game.min_players,
                          game.max_players,
                          game.is_only_even_players_required,
                        )
                      }
                    >
                      Play With Mates
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* JOIN ROOM MODAL */}

      {isJoinRoomModalOpen && (
        <JoinRoomModal
          isJoinRoomModalOpen={isJoinRoomModalOpen}
          localJoinRoom={localJoinRoom}
          setIsJoinRoomModalOpen={setIsJoinRoomModalOpen}
        />
      )}

      {/* rules Modal */}

      {isRulesModalOpen && (
         <RulesModal
          isRulesModalOpen={isRulesModalOpen}
          setIsRoomsModalOpen={setIsRulesOpen}
        />
      )
      }

      {/* ROOM LOBBY */}

      {(roomDetails && !gameStarted) && (
        <RoomLobby
          isHost={isHost}
          roomDetails={roomDetails}
          localLeaveRoom={localLeaveRoom}
          localDeleteRoom={localDeleteRoom}
          localKickPlayer={localKickPlayer}
          gameType={roomDetails.gameType}
          localChangeGameType={localChangeGameType}
          localChangeGameName={localChangeGameName}
          localStartGame={localStartGame}
        />
      )}

      {/* ONLINE ROOMS */}

      {onlineRoomsView && (
        <OnlineRoomsView
          game={selectedOnlineGame}
          onBack={() => {
            setSelectedOnlineGame(null);
            setOnlineRoomsView(false);
          }}
          localJoinRoom={localJoinRoom}
          localCreateRoom={localCreateRoom}
        />
      )}

      {(gameStarted && roomDetails && roomDetails.gameName === "Five Alive") &&
        <FiveAlive roomDetails={roomDetails} socketState={socketState} fiveAliveGameDetails={fiveAliveGameDetails} localLeaveRoom={localLeaveRoom}/>
      }

      {(gameStarted && roomDetails && roomDetails.gameName === "Four Card Challenge") &&
        <FourCardChallenge roomDetails={roomDetails} socketState={socketState} fourCardChallengeGameDetails={fourCardChallengeGameDetails} localLeaveRoom={localLeaveRoom}/>
      }

      {(gameStarted && roomDetails && roomDetails.gameName === "Seven Card Challenge") &&
        <SevenCardChallenge roomDetails={roomDetails} socketState={socketState} sevenCardChallengeGameDetails={sevenCardChallengeGameDetails} localLeaveRoom={localLeaveRoom}/>
      }

      {(gameStarted && roomDetails && roomDetails.gameName === "Ace") &&
        <Ace roomDetails={roomDetails} socketState={socketState} aceGameDetails={aceGameDetails} localLeaveRoom={localLeaveRoom}/>
      }

      {(gameStarted && roomDetails && roomDetails.gameName === "Ticket To Ride") &&
        <TicketToRide roomDetails={roomDetails} socketState={socketState} ticketToRideGameDetails={ticketToRideGameDetails} localLeaveRoom={localLeaveRoom}/>
      }

      <GlobalSnackbar ref={snackbarRef} />
    </div>
  );
};

export default DashboardUI;
