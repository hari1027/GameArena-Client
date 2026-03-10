/* eslint-disable react-hooks/set-state-in-effect */

import type z from "zod";
import type { join_room_Schema } from "../Utils/LobbyDetails";
import { useEffect, useRef, useState } from "react";
import {
  OnlineRoomsForOtherGame,
  OnlineRoomsForYourGame,
} from "../Services/ApiService";
import type { SnackbarHandle } from "../GlobalSnackbar";
import axios from "axios";
import GlobalSnackbar from "../GlobalSnackbar";
import "./onlineRoomsView.css";
import type { GameWithoutIcon } from "../Utils/GamesDetail";

type JoinRoomValues = z.infer<typeof join_room_Schema>;

interface OnlineRoomsViewProps {
  game: GameWithoutIcon | null;
  onBack: () => void;
  localJoinRoom: (data: JoinRoomValues) => void;
  localCreateRoom: (
    username: string,
    gamename: string,
    type: string,
    minPlayers: number,
    maxPlayers: number,
    isEvenPlayersReq: boolean,
  ) => void;
}

interface OnlineRoomDetails {
  roomId: string;
  gameName: string;
  maxPlayers: number;
  playersCount: number;
  createdAt: string;
}

const OnlineRoomsView = ({
  game,
  onBack,
  localJoinRoom,
  localCreateRoom,
}: OnlineRoomsViewProps) => {
  const snackbarRef = useRef<SnackbarHandle>(null);
  const [internalView, setInternalView] = useState<
    "selected_game" | "other_games"
  >("selected_game");
  const [data, setData] = useState<OnlineRoomDetails[]>([]);
  const [roomTimes, setRoomTimes] = useState<Record<string, string>>({});
  const [serverTimeDiff, setServerTimeDiff] = useState(0);

  const calculateTimeRemaining = (createdAt: string) => {
    const normalizeToUTC = (time: string) =>
      time.endsWith("Z") ? time : time + "Z";

    const now = Date.now() + serverTimeDiff;
    const createdTime = new Date(normalizeToUTC(createdAt)).getTime();

    const totalDuration = 5 * 60 * 1000; // 5 minutes in ms
    const remaining = totalDuration - (now - createdTime);

    if (remaining <= 0) return "00:00";

    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: Record<string, string> = {};
      data.forEach((room) => {
        updatedTimes[room.roomId] = calculateTimeRemaining(room.createdAt);
      });
      setRoomTimes(updatedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [data, serverTimeDiff]);

  const getRooms = async () => {
    try {
      if (!game) return;

      const response =
        internalView === "selected_game"
          ? await OnlineRoomsForYourGame(game.name)
          : await OnlineRoomsForOtherGame(game.name);

      const sorted = response.data.sort(
        (a: OnlineRoomDetails, b: OnlineRoomDetails) =>
          b.playersCount / b.maxPlayers - a.playersCount / a.maxPlayers,
      );

      if (response.serverTime) {
        const serverNow = new Date(response.serverTime).getTime(); // if your API returns server time
        const clientNow = Date.now();
        const diff = serverNow - clientNow; // server - client

        setServerTimeDiff(diff); // save this in state
      }

      setData(sorted);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          error.response?.data?.message || "Failed to fetch rooms",
          "error",
        );
      } else {
        snackbarRef.current?.showNotification("Something went wrong", "error");
      }
    }
  };

  useEffect(() => {
    getRooms();
    const interval = setInterval(getRooms, 10000);
    return () => clearInterval(interval);
  }, [internalView]);

  const createOnlineRoom = () => {
    if (game && sessionStorage.getItem("username")) {
      const username = sessionStorage.getItem("username")!;
      localCreateRoom(
        username,
        game.name,
        "Play Online",
        game.min_players,
        game.max_players,
        game.is_only_even_players_required,
      );
    } else {
      snackbarRef.current?.showNotification(
        "Game Deatils and Username is required to create a game . Go Back and try again",
        "error",
      );
    }
  };

  return (
    <div className="online-rooms-container">
      <div className="online-rooms-header">
        <h2>Online Rooms</h2>

        <div className="online-rooms-actions">
          <button className="btn-primary" onClick={onBack}>
            Back
          </button>

          <button
            className="btn-primary"
            onClick={() =>
              setInternalView(
                internalView === "selected_game"
                  ? "other_games"
                  : "selected_game",
              )
            }
          >
            {internalView === "selected_game"
              ? "Show Other Games"
              : "Show Selected Game"}
          </button>

          <button className="btn-primary" onClick={createOnlineRoom}>
            Create Online Game
          </button>
        </div>
      </div>

      <div className="rooms-scroll-container">
        {data.length === 0 ? (
          <div className="empty-state">No rooms available</div>
        ) : (
          data.map((room) => (
            <div key={room.roomId} className="room-card">
              <div className="room-info">
                <h3>{room.gameName}</h3>
                <p>Room ID : {room.roomId}</p>
                <p>
                  Players : {room.playersCount}/{room.maxPlayers}
                </p>
                <p>Time Remaining : {roomTimes[room.roomId] || "05:00"}</p>
              </div>

              <button
                className="btn-join"
                disabled={room.playersCount >= room.maxPlayers}
                onClick={() =>
                  localJoinRoom({
                    roomId: room.roomId,
                    gameType: "Play Online",
                  })
                }
              >
                {room.playersCount >= room.maxPlayers ? "Room Full" : "Join"}
              </button>
            </div>
          ))
        )}
      </div>

      <GlobalSnackbar ref={snackbarRef} />
    </div>
  );
};

export default OnlineRoomsView;
