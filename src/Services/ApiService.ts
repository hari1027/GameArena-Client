import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SignupPayload {
  username: string;
  password: string;
}

export interface SigninPayload {
  username: string;
  password: string;
}

export interface LogoutPayload {
  username: string | null;
}

export interface CreateRoomPayload {
  username: string;
  gameName: string;
  gameType: string;
  minPlayers: number;
  maxPlayers: number;
  isEvenPlayersReq: boolean;
}

export interface LeaveRoomPayload {
  username: string;
  roomId: string;
}

export interface DeleteRoomPayload {
  username: string;
  roomId: string;
}

export interface kickPlayerPayload {
  username: string;
  roomId: string;
  usernameToKick: string;
}

export interface ChangeGameTypePayload {
  roomId: string;
}

export interface ChangeGameNamePayload {
  username: string;
  roomId: string;
  gameName: string;
  maxPlayers: number;
  minPlayers: number;
  isEvenPlayers: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  serverTime?: string
}

export const signup = (payload: SignupPayload): Promise<ApiResponse> => {
  return axios.post(`${API_BASE_URL}/signup`, payload).then((res) => res.data);
};

export const signin = (payload: SigninPayload): Promise<ApiResponse> => {
  return axios.post(`${API_BASE_URL}/signin`, payload).then((res) => res.data);
};

export const logout = (payload: LogoutPayload): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/logout`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const makeUserInactive = (payload: LogoutPayload): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/makeUserActiveToFalse`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const makeUserActive = (payload: LogoutPayload): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/makeUserActiveToTrue`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const createRoom = (
  payload: CreateRoomPayload,
): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/create_room`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const leaveRoom = (payload: LeaveRoomPayload): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/leave_room`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const deleteRoom = (
  payload: DeleteRoomPayload,
): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/delete_room`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const kickPlayer = (
  payload: kickPlayerPayload,
): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/kick_player`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const OnlineRoomsForYourGame = (
  gameName: string,
): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .get(`${API_BASE_URL}/rooms/game/${gameName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const OnlineRoomsForOtherGame = (
  gameName: string,
): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .get(`${API_BASE_URL}/rooms/other-games/${gameName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const changeGameType = (roomId: string): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .patch(`${API_BASE_URL}/rooms/${roomId}/game-type`,{}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const changeGameName = (payload: ChangeGameNamePayload): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/rooms/change-game`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};

export const startGame = (roomId:string): Promise<ApiResponse> => {
  const token = sessionStorage.getItem("token");

  return axios
    .post(`${API_BASE_URL}/rooms/${roomId}/startGame`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
};