import { useEffect, useRef, useState } from "react";
import {
  // useRoomAudio,
  type change_game_Schema,
  type Room,
} from "../Utils/LobbyDetails";
import "./roomLobby.css";
import ChangeGameModal from "./ChangeGameModal";
import type z from "zod";
import type { SnackbarHandle } from "../GlobalSnackbar";
import GlobalSnackbar from "../GlobalSnackbar";

type ChangeGameValues = z.infer<typeof change_game_Schema>;

interface RoomLobbyProps {
  localLeaveRoom: () => void;
  localDeleteRoom: () => void;
  localKickPlayer: (usernameToKick: string) => void;
  localChangeGameType: (roomId: string) => void;
  localChangeGameName: (data: ChangeGameValues) => void;
  localStartGame: () => void;
  isHost: boolean;
  roomDetails: Room;
  gameType: string;
}

const RoomLobby = ({
  roomDetails,
  isHost,
  localLeaveRoom,
  localDeleteRoom,
  localKickPlayer,
  localChangeGameType,
  gameType,
  localChangeGameName,
  localStartGame,
}: RoomLobbyProps) => {
  const [isChangeGameModalOpen, setIsChangeGameModalOpen] =
    useState<boolean>(false);
  // const { speakingUsers } = useRoomAudio();
  const snackbarRef = useRef<SnackbarHandle>(null);

  const [secondsLeft, setSecondsLeft] = useState<number>(5 * 60); // 5 minutes default

  useEffect(() => {
    if (gameType !== "Play Online") return;

    const normalizeToUTC = (time: string) =>
      time.endsWith("Z") ? time : time + "Z";

    const now = new Date(normalizeToUTC(roomDetails.timeNow)).getTime();
    const createdTime = new Date(
      normalizeToUTC(roomDetails.createdAt),
    ).getTime();

    // Calculate initial seconds left
    let initialSecondsLeft = Math.floor(
      (5 * 60 * 1000 - (now - createdTime)) / 1000,
    );
    if (initialSecondsLeft < 0) initialSecondsLeft = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsLeft(initialSecondsLeft);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameType, roomDetails.createdAt, roomDetails.timeNow]);

  useEffect(() => {
    if (gameType !== "Play Online" || !isHost) return;

    const playerCount = roomDetails.players.length;

    // 1️⃣ Auto start if MaxPlayers reached
    if (playerCount === roomDetails.maxPlayers) {
      localStartGame();
      return;
    }

    // 2️⃣ Auto start if room exists for more than 5 minutes
    const normalizeToUTC = (time: string) =>
      time.endsWith("Z") ? time : time + "Z";

    const now = new Date(normalizeToUTC(roomDetails.timeNow)).getTime();
    const createdTime = new Date(
      normalizeToUTC(roomDetails.createdAt),
    ).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const remainingTime = FIVE_MINUTES - (now - createdTime);

    // if (remainingTime <= 0) {
    //   localStartGame();
    //   return;
    // }

    // Timer to auto start exactly at 5 minutes
    const timer = setTimeout(() => {
      const isWithinRange =
        playerCount >= roomDetails.minPlayers &&
        playerCount <= roomDetails.maxPlayers;

      const isEvenConditionSatisfied =
        !roomDetails.isEvenPlayersReq || playerCount % 2 === 0;

      if (isWithinRange && isEvenConditionSatisfied) {
        localStartGame();
      } else {
        snackbarRef.current?.showNotification(
          "Requirements to the game is not satisfied so deleting the room",
          "info",
        );
        localDeleteRoom();
      }
    }, remainingTime);

    return () => {
      clearTimeout(timer);
    };
  }, [isHost, gameType, roomDetails.players.length, roomDetails.maxPlayers, roomDetails.createdAt, roomDetails.timeNow, localStartGame, roomDetails.minPlayers, roomDetails.isEvenPlayersReq, localDeleteRoom]);

  return (
    <main className="dashboard-main">
      <div className="lobby-header">
        <h2>Room Lobby</h2>
        <p>
          <strong>Room ID :</strong> <strong>{roomDetails.roomId}</strong>{" "}
        </p>
        <p>
          <strong>Game :</strong> <strong>{roomDetails.gameName}</strong>{" "}
        </p>
        <p>
          <strong>Room Type :</strong>{" "}
          <strong>
            {roomDetails.gameType === "Play Online" ? "Public" : "Private"}
          </strong>{" "}
        </p>
        {roomDetails.gameType === "Play Online" && (
          <p>
            <strong>Game Starts In :</strong>{" "}
            <strong>
              {Math.floor(secondsLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(secondsLeft % 60).toString().padStart(2, "0")}
            </strong>{" "}
          </p>
        )}
      </div>

      <div className="players-section">
        <h3>Total Players in the Room - {roomDetails.players.length}</h3>

        <table className="players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Role</th>
              {/* <th>Audio</th> */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {roomDetails.players.map((player) => {
              const isPlayerHost = player === roomDetails.host;

              return (
                <tr key={player}>
                  <td>{player}</td>
                  <td>{isPlayerHost ? "Host" : "Player"}</td>

                  {/* <td>
                    {speakingUsers.includes(player) && (
                      <span className="voice-indicator" />
                    )}
                  </td> */}

                  <td>
                    <button
                      className="btn icon danger"
                      disabled={
                        !isHost ||
                        gameType !== "Play With Mates" ||
                        isPlayerHost
                      }
                      title={
                        !isHost || gameType !== "Play With Mates"
                          ? "Only host can kick"
                          : isPlayerHost
                            ? "Host cannot kick himself"
                            : "Kick player"
                      }
                      onClick={() => {
                        localKickPlayer(player);
                      }}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lobby-actions">
        <button
          className="btn primary"
          disabled={!isHost || gameType !== "Play With Mates"}
          onClick={localStartGame}
        >
          Play
        </button>
        <button
          className="btn success"
          disabled={!isHost || gameType !== "Play With Mates"}
          onClick={() => {
            localChangeGameType(roomDetails.roomId);
          }}
        >
          Publish Room Online
        </button>
        <button
          className="btn secondary"
          disabled={!isHost || gameType !== "Play With Mates"}
          onClick={() => {
            setIsChangeGameModalOpen(true);
          }}
        >
          Change Game
        </button>
        <button
          className="btn warning"
          disabled={isHost}
          onClick={localLeaveRoom}
        >
          Leave Room
        </button>
        <button
          className="btn danger"
          disabled={!isHost}
          onClick={localDeleteRoom}
        >
          Delete Room
        </button>
      </div>
      {isChangeGameModalOpen && (
        <ChangeGameModal
          isChangeGameModalOpen={isChangeGameModalOpen}
          setIsChangeGameModalOpen={(value: boolean) => {
            setIsChangeGameModalOpen(value);
          }}
          selectedGame={roomDetails.gameName}
          localChangeGameName={(data: ChangeGameValues) => {
            localChangeGameName(data);
          }}
        />
      )}
      <GlobalSnackbar ref={snackbarRef} />
    </main>
  );
};

export default RoomLobby;
