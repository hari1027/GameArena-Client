/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type z from "zod";
import DashboardUI from "./DashboardUI";
import { RoomAudioProvider } from "./RoomAudioContext";

import {
  changeGameName,
  changeGameType,
  createRoom,
  deleteRoom,
  kickPlayer,
  leaveRoom,
  logout,
  startGame,
} from "../Services/ApiService";

import type { SnackbarHandle } from "../GlobalSnackbar";
import {
  useRoomAudio,
  type change_game_Schema,
  type join_room_Schema,
  type Room,
} from "../Utils/LobbyDetails";
import { games, type GameWithoutIcon } from "../Utils/GamesDetail";
import axios from "axios";
import type { FiveAliveGameDetails } from "../Utils/Five Alive";
import type { FourCardChallengeGameDetails } from "../Utils/Four Card Challenge";
import type { SevenCardChallengeGameDetails } from "../Utils/Seven Card Challenge";
import type { AceGameDetails } from "../Utils/Ace";
import Spinner from "../Spinner";

interface DashboardProps {
  user: string;
  toggleTheme: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
}

const Dashboard = ({
  user,
  toggleTheme,
  isDarkMode,
  onLogout,
}: DashboardProps) => {
  /* ------------------ refs & state ------------------ */

  const snackbarRef = useRef<SnackbarHandle>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);

  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);

  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesOpen] = useState(false);

  const [onlineRoomsView, setOnlineRoomsView] = useState(false);
  const [selectedOnlineGame, setSelectedOnlineGame] =
    useState<GameWithoutIcon | null>(null);

  type JoinRoomValues = z.infer<typeof join_room_Schema>;
  type ChangeGameValues = z.infer<typeof change_game_Schema>;

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [fiveAliveGameDetails, setFiveAliveGameDetails] =
    useState<FiveAliveGameDetails | null>(null);
  const [fourCardChallengeGameDetails, setFourCardChallengeGameDetails] =
    useState<FourCardChallengeGameDetails | null>(null);
  const [sevenCardChallengeGameDetails, setSevenCardChallengeGameDetails] =
    useState<SevenCardChallengeGameDetails | null>(null);
  const [aceGameDetails, setAceGameDetails] = useState<AceGameDetails | null>(
    null,
  );

  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketState(null);
  };

  /* ------------------ SESSION STORAGE HELPERS ------------------ */
  const saveRoomSession = (roomId: string, gameType: string) => {
    sessionStorage.setItem("roomId", roomId);
    sessionStorage.setItem("gameType", gameType);
  };

  const clearRoomSession = () => {
    sessionStorage.removeItem("roomId");
    sessionStorage.removeItem("gameType");
    sessionStorage.removeItem("gameStarted");
    sessionStorage.removeItem("timeleft")
  };

  /* ------------------ socket logic ------------------ */

  const socketOperations = async (
    roomId: string,
    username: string,
    gameType: string,
    isReconnect: boolean = false,
  ) => {
    cleanupSocket();

    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL}`, {
      transports: ["websocket"],
      forceNew: true, // VERY IMPORTANT
    });

    socketRef.current = newSocket;
    setSocketState(newSocket);

    if (!isReconnect) saveRoomSession(roomId, gameType);

    if (isReconnect) {
      newSocket.emit("rejoin_room", { roomId, username });
    } else {
      newSocket.emit("join_room", { roomId, username, gameType });
    }

    // ---------------- handle ping ----------------
    newSocket.on("ping", () => {
      newSocket.emit("pong", { username, roomId });
    });

    newSocket.on("join_error", (updatedRoom) => {
      if (updatedRoom.to === username) {
        snackbarRef.current?.showNotification(updatedRoom.message, "error");
        cleanupSocket();
        clearRoomSession();
      }
    });

    newSocket.on("user disconnection", (updatedRoom) => {
      snackbarRef.current?.showNotification(updatedRoom.message, "info");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 7000);
      //need to implement pause screen for grace time which we are going to give with a state to handle multiple disconnections of user at same time
    });

    newSocket.on("user rejoined", (updatedRoom) => {
      console.log(updatedRoom);
      setLoading(false);
      //need to implement the release of pause screen with a state to handle multiple disconnections of user at same time
    });

    newSocket.on("FiveAlive Game Object", (gameObj) => {
      if (
        sessionStorage.getItem("gameStarted") &&
        sessionStorage.getItem("gameStarted") !== null &&
        sessionStorage.getItem("gameStarted") === "true" &&
        gameObj.to === username
      ) {
        setFiveAliveGameDetails(gameObj);
      }
    });

    newSocket.on("FourCardChallenge Game Object", (gameObj) => {
      if (
        sessionStorage.getItem("gameStarted") &&
        sessionStorage.getItem("gameStarted") !== null &&
        sessionStorage.getItem("gameStarted") === "true" &&
        gameObj.to === username
      ) {
        setFourCardChallengeGameDetails(gameObj);
      }
    });

    newSocket.on("SevenCardChallenge Game Object", (gameObj) => {
      if (
        sessionStorage.getItem("gameStarted") &&
        sessionStorage.getItem("gameStarted") !== null &&
        sessionStorage.getItem("gameStarted") === "true" &&
        gameObj.to === username
      ) {
        setSevenCardChallengeGameDetails(gameObj);
      }
    });

    newSocket.on("Ace Game Object", (gameObj) => {
      if (
        sessionStorage.getItem("gameStarted") &&
        sessionStorage.getItem("gameStarted") !== null &&
        sessionStorage.getItem("gameStarted") === "true" &&
        gameObj.to === username
      ) {
        setAceGameDetails(gameObj);
      }
    });

    newSocket.on("room_update", (updatedRoom) => {
      //  if(updatedRoom.roomId === roomId){
      if (onlineRoomsView) {
        setOnlineRoomsView(false);
        setSelectedOnlineGame(null);
      }

      // if (
      //   !(
      //     updatedRoom.message === "Game started" &&
      //     updatedRoom.gameName === "Five Alive"
      //   )
      // ) {
      //   snackbarRef.current?.showNotification(updatedRoom.message, "info");
      // }

      if (updatedRoom.message === `${username} was kicked by host`) {
        snackbarRef.current?.showNotification(
          "Sorry You have been Kicked out of the room by the host",
          "info",
        );
        setRoomDetails(null);
        setIsHost(false);
        clearRoomSession();
        cleanupSocket();
      } else {
        setRoomDetails(updatedRoom);
      }

      if (updatedRoom.host === sessionStorage.getItem("username")) {
        setIsHost(true);
      }
      if (
        updatedRoom.message ===
        "Room has been successfully hosted to Online by the host"
      ) {
        sessionStorage.setItem("gameType", updatedRoom.gameType);
      }
      if (updatedRoom.message === `${username} rejoined successfully`) {
        if (
          sessionStorage.getItem("gameStarted") &&
          sessionStorage.getItem("gameStarted") !== null &&
          sessionStorage.getItem("gameStarted") === "true"
        ) {
          setGameStarted(true);
        }
      }
      if (isJoinRoomModalOpen) {
        setIsJoinRoomModalOpen(false);
      }

      //-----------------------------------------------------------------------------------------------------------------

      if (updatedRoom.message === "Game started") {
        setGameStarted(true);
        sessionStorage.setItem("gameStarted", "true");
      }

      // }
    });

    newSocket.on("room_deleted", (data) => {
      snackbarRef.current?.showNotification(data.message, "info");
      setRoomDetails(null);
      setIsHost(false);
      clearRoomSession();
      cleanupSocket();
      setGameStarted(false);
      if (fiveAliveGameDetails !== null) {
        setFiveAliveGameDetails(null);
      }
      if (fourCardChallengeGameDetails !== null) {
        setFourCardChallengeGameDetails(null);
      }
      if (sevenCardChallengeGameDetails !== null) {
        setSevenCardChallengeGameDetails(null);
      }
      if (aceGameDetails !== null) {
        setAceGameDetails(null);
      }
    });

    newSocket.on("fivealive_game_state", (data) => {
      setFiveAliveGameDetails(data);
      snackbarRef.current?.showNotification(`${data.message}`, "info");
      setTimeout(() => {
        snackbarRef.current?.showNotification(
          `${data.currentTurn} turn`,
          "info",
        );
      }, 3000);
    });

    newSocket.on("fcc_game_state", (data) => {
      setFourCardChallengeGameDetails(data);
      snackbarRef.current?.showNotification(`${data.message}`, "info");
      setTimeout(() => {
        snackbarRef.current?.showNotification(`${data.turn} turn`, "info");
      }, 3000);
    });

    newSocket.on("scc_game_state", (data) => {
      setSevenCardChallengeGameDetails(data);
      snackbarRef.current?.showNotification(`${data.message}`, "info");
      setTimeout(() => {
        snackbarRef.current?.showNotification(`${data.turn} turn`, "info");
      }, 3000);
    });

    newSocket.on("ace_game_state", (data) => {
      setAceGameDetails(data);
      snackbarRef.current?.showNotification(`${data.message}`, "info");
      setTimeout(() => {
        snackbarRef.current?.showNotification(
          `${data.currentTurn} turn`,
          "info",
        );
      }, 3000);
    });
  };

  /* ------------------ AUTO RECONNECT ON REFRESH ------------------ */
  useEffect(() => {
    const roomId = sessionStorage.getItem("roomId");
    const gameType = sessionStorage.getItem("gameType");
    const username = sessionStorage.getItem("username");

    if (
      roomId &&
      gameType &&
      username &&
      roomId !== null &&
      gameType !== null &&
      username !== null
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      socketOperations(roomId, username, gameType, true); // reconnect = true
    }
  }, []);

  /* ------------------ API handlers ------------------ */

  const localCreateRoom = async (
    username: string,
    gamename: string,
    type: string,
    minPlayers: number,
    maxPlayers: number,
    isEvenPlayersReq: boolean,
  ) => {
    setLoading(true);
    try {
      const response = await createRoom({
        username: username,
        gameName: gamename,
        gameType: type,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        isEvenPlayersReq: isEvenPlayersReq,
      });

      const roomId = response.data?.roomId;

      if (!roomId) {
        snackbarRef.current?.showNotification(
          "Room creation failed: no room ID returned",
          "error",
        );
        return;
      }

      snackbarRef.current?.showNotification(
        `Room created successfully`,
        "success",
      );
      socketOperations(roomId, username, type);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Room Creation Failed - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Room Creation Failed - Something went wrong",
          "error",
        );
      }
    }
  };

  const localJoinRoom = async (data: JoinRoomValues) => {
    setLoading(true);
    const roomId = data.roomId;
    const username = sessionStorage.getItem("username");
    const gameType = data.gameType;
    if (roomId && username && gameType) {
      socketOperations(roomId, user, gameType);
    } else {
      snackbarRef.current?.showNotification(
        "RoomId , GameType and Username is required",
        "error",
      );
    }
    setLoading(false);
  };

  const localLeaveRoom = async () => {
    setLoading(true);
    const username = sessionStorage.getItem("username");
    const roomId = roomDetails?.roomId;
    try {
      if (username && roomId) {
        const response = await leaveRoom({
          roomId: roomId,
          username: username,
        });

        if (response.message === `${username} left the room`) {
          snackbarRef.current?.showNotification(
            "You have left the room successfully",
            "success",
          );
          setIsHost(false);
          setRoomDetails(null);
          clearRoomSession();
          cleanupSocket();
          setGameStarted(false);
          if (fiveAliveGameDetails !== null) {
            setFiveAliveGameDetails(null);
          }
          if (fourCardChallengeGameDetails !== null) {
            setFourCardChallengeGameDetails(null);
          }
          if (sevenCardChallengeGameDetails !== null) {
            setSevenCardChallengeGameDetails(null);
          }
          if (aceGameDetails !== null) {
            setAceGameDetails(null);
          }
        } else {
          snackbarRef.current?.showNotification(
            "Unable to leave the room",
            "error",
          );
        }
      } else {
        snackbarRef.current?.showNotification(
          "RoomId and Username is required",
          "error",
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Unable to leave the room - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Error in leaving the room - Something went wrong",
          "error",
        );
      }
    }
  };

  const localDeleteRoom = async () => {
    setLoading(true);
    const username = sessionStorage.getItem("username");
    const roomId = roomDetails?.roomId;
    try {
      if (username && roomId) {
        const response = await deleteRoom({
          username: username,
          roomId: roomId,
        });

        if (response.message === `Room was deleted by host`) {
          snackbarRef.current?.showNotification(
            "Room has been deleted successfully",
            "success",
          );
        } else {
          snackbarRef.current?.showNotification(
            "Unable to delete the room",
            "error",
          );
        }
      } else {
        snackbarRef.current?.showNotification(
          "RoomId and Username is required",
          "error",
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Unable to delete the room - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Error in deleting the room - Something went wrong",
          "error",
        );
      }
    }
  };

  const localKickPlayer = async (usernameToKick: string) => {
    setLoading(true);
    const username = sessionStorage.getItem("username");
    const roomId = roomDetails?.roomId;
    try {
      if (username && roomId && usernameToKick) {
        const response = await kickPlayer({
          username: username,
          roomId: roomId,
          usernameToKick: usernameToKick,
        });

        if (response.message === `${usernameToKick} was kicked by host`) {
          snackbarRef.current?.showNotification(
            `${usernameToKick} was kicked out Successfully`,
            "success",
          );
        } else {
          snackbarRef.current?.showNotification(
            "Unable to Kick the player out of the room",
            "error",
          );
        }
      } else {
        snackbarRef.current?.showNotification(
          "RoomId and Username and player to kick out is required",
          "error",
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Unable to Kick the player out of the room"- ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Error in Kicking the player out of the room - Something went wrong",
          "error",
        );
      }
    }
  };

  const localChangeGameType = async (roomId: string) => {
    setLoading(true);
    try {
      const response = await changeGameType(roomId);
      console.log(response.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Publishing Online Failed - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Publishing Online Failed - Something went wrong",
          "error",
        );
      }
    }
  };

  const localChangeGameName = async (data: ChangeGameValues) => {
    setLoading(true);
    const username = sessionStorage.getItem("username");
    const roomId = roomDetails?.roomId;
    try {
      if (username && roomId && data.gameName) {
        const selectedGame = games.find((game) => game.name === data.gameName);

        if (!selectedGame) {
          snackbarRef.current?.showNotification(
            "Selected Game details not found",
            "error",
          );
          return;
        }

        const response = await changeGameName({
          roomId,
          username,
          gameName: data.gameName,
          maxPlayers: selectedGame.max_players,
          minPlayers: selectedGame.min_players,
          isEvenPlayers: selectedGame.is_only_even_players_required,
        });

        console.log(response.message);
      } else {
        snackbarRef.current?.showNotification(
          "RoomId , GameName and Username is required",
          "error",
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Unable to change game - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Error in changing the game - Something went wrong",
          "error",
        );
      }
    }
  };

  const localStartGame = async () => {
    setLoading(true);
    try {
      if (roomDetails?.roomId) {
        const response = await startGame(roomDetails.roomId);
        console.log(response);
      } else {
        snackbarRef.current?.showNotification(
          "RoomId is required to start the game",
          "error",
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Unable to Start the game - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Unable to Start the game  - Something went wrong",
          "error",
        );
      }
    }
  };

  const localLogout = async () => {
    setLoading(true);
    try {
      const response = await logout({
        username: user,
      });
      snackbarRef.current?.showNotification(`${response.message}`, "success");
      setTimeout(() => onLogout(), 1000);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        snackbarRef.current?.showNotification(
          `Logout Failed - ${error.response?.data?.message}`,
          "error",
        );
      } else {
        snackbarRef.current?.showNotification(
          "Logout Failed - Something went wrong",
          "error",
        );
      }
    }
  };

  /* ------------------ UI WITH AUDIO CONTEXT ------------------ */

  if (!roomDetails) {
    return (
      <>
        <DashboardUI
          user={user}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={localLogout}
          roomDetails={null}
          isHost={false}
          showMic={false}
          isMicMuted={true}
          onToggleMic={() => {}}
          onlineRoomsView={onlineRoomsView}
          selectedOnlineGame={selectedOnlineGame}
          isJoinRoomModalOpen={isJoinRoomModalOpen}
          isRulesModalOpen={isRulesModalOpen}
          setIsJoinRoomModalOpen={setIsJoinRoomModalOpen}
          setIsRulesOpen={setIsRulesOpen}
          localJoinRoom={localJoinRoom}
          localCreateRoom={localCreateRoom}
          localLeaveRoom={localLeaveRoom}
          localDeleteRoom={localDeleteRoom}
          localKickPlayer={localKickPlayer}
          localChangeGameType={localChangeGameType}
          localChangeGameName={localChangeGameName}
          localStartGame={localStartGame}
          setOnlineRoomsView={setOnlineRoomsView}
          setSelectedOnlineGame={setSelectedOnlineGame}
          snackbarRef={snackbarRef}
          gameStarted={gameStarted}
          socketState={socketState}
          fiveAliveGameDetails={fiveAliveGameDetails}
          fourCardChallengeGameDetails={fourCardChallengeGameDetails}
          sevenCardChallengeGameDetails={sevenCardChallengeGameDetails}
          aceGameDetails={aceGameDetails}
        />
        {loading && <Spinner />}
      </>
    );
  }

  /* -------- INSIDE AUDIO PROVIDER -------- */

  return (
    <RoomAudioProvider
      socket={socketState}
      //roomId={roomDetails.roomId}
    >
      <AudioConnectedDashboard
        {...{
          user,
          toggleTheme,
          isDarkMode,
          localLogout,
          roomDetails,
          isHost,
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
        }}
      />
      {loading && <Spinner />}
    </RoomAudioProvider>
  );
};

/* -------- SMALL INNER BRIDGE COMPONENT -------- */

const AudioConnectedDashboard = (props: any) => {
  const roomAudio = useRoomAudio();

  return (
    <DashboardUI
      {...props}
      showMic={true}
      isMicMuted={roomAudio.muted}
      onToggleMic={roomAudio.toggleMute}
    />
  );
};

export default Dashboard;
