import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { join_room_Schema } from "../Utils/LobbyDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import "./joinRoomModal.css";

type JoinRoomValues = z.infer<typeof join_room_Schema>;

interface JoinRoomModalProps {
  localJoinRoom: (data: JoinRoomValues) => void;
  isJoinRoomModalOpen: boolean;
  setIsJoinRoomModalOpen: (value: boolean) => void;
}

const JoinRoomModal = ({
  isJoinRoomModalOpen,
  setIsJoinRoomModalOpen,
  localJoinRoom,
}: JoinRoomModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JoinRoomValues>({
    resolver: zodResolver(join_room_Schema),
    mode: "onTouched",
  });

  useEffect(() => {
    setValue("roomId", "");
    setValue("gameType", "Play With Mates");
  }, [isJoinRoomModalOpen, setValue]);

  return (
    <Dialog
      open={isJoinRoomModalOpen}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        setIsJoinRoomModalOpen(false);
      }}
      disableEscapeKeyDown
      className="join-room-dialog"
    >
      <DialogTitle className="dialog-title">
        Join Room
        <IconButton
          aria-label="close"
          className="dialog-close-btn"
          onClick={() => setIsJoinRoomModalOpen(false)}
        >
          <XIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(localJoinRoom)}>
          <div className="input-group">
            <label>RoomId</label>
            <input
              {...register("roomId")}
              className={`input-field ${errors.roomId ? "error" : ""}`}
              placeholder="Enter RoomId"
              type="text"
            />
            {errors.roomId && (
              <p className="error-message">{errors.roomId.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Joining" : "Join"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRoomModal;
