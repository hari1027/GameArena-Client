import { z } from "zod";
import { createContext, useContext } from "react";

export interface Room {
  roomId: string;
  gameName: string;
  gameType: string;
  host: string;
  players: string[];
  message: string;
  maxPlayers: number;
  minPlayers: number;
  isEvenPlayersReq: boolean;
  createdAt : string;
  timeNow : string;
}

export const join_room_Schema = z.object({
  roomId: z.string().length(4, { message: "RoomId is exactly 4 Characters" }),
  gameType: z.string()
});

export const change_game_Schema = z.object({
  gameName: z.string().min(1, "Please select a game")
})


// -------------- Audio ------------------------------------------------------------

export interface RoomAudioContextType {
  muted: boolean;
  toggleMute: () => void;
  //speakingUsers: string[];
}

export interface RoomAudioProviderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any; 
  //roomId: string;
  children: React.ReactNode;
}

export interface SpeakingPayload {
  roomId: string;
  speaking: boolean;
}

// export interface SpeakingUpdatePayload {
//   username: string;
//   speaking: boolean;
// }

export const RoomAudioContext =
  createContext<RoomAudioContextType | null>(null);

export const useRoomAudio = (): RoomAudioContextType => {
  const ctx = useContext(RoomAudioContext);
  if (!ctx) {
    throw new Error("useRoomAudio must be used inside RoomAudioProvider");
  }
  return ctx;
};


export const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
  },
};

export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:your-turn-server.com:3478",
      username: "turnuser",
      credential: "turnpassword",
    },
  ],
};

//---------------------------------------------------

export const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
