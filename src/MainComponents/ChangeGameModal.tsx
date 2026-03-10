import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { XIcon } from "lucide-react";
import type z from "zod";
import { change_game_Schema } from "../Utils/LobbyDetails";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { games } from "../Utils/GamesDetail";
import './changeGameModal.css'

type ChangeGameValues = z.infer<typeof change_game_Schema>;

interface ChangeGameModalProps {
  localChangeGameName: (data: ChangeGameValues) => void;
  isChangeGameModalOpen: boolean;
  setIsChangeGameModalOpen: (value: boolean) => void;
  selectedGame: string;
}

const ChangeGameModal = ({
  localChangeGameName,
  isChangeGameModalOpen,
  setIsChangeGameModalOpen,
  selectedGame,
}: ChangeGameModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChangeGameValues>({
    resolver: zodResolver(change_game_Schema),
    mode: "onTouched",
  });

  useEffect(() => {
    setValue("gameName", "");
  }, [isChangeGameModalOpen, setValue]);

const submitForm = (data: ChangeGameValues) => {
  localChangeGameName(data); 
  setIsChangeGameModalOpen(false); 
};

  return (
    <Dialog
      open={isChangeGameModalOpen}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        setIsChangeGameModalOpen(false);
      }}
      disableEscapeKeyDown
      className="join-room-dialog"
    >
      <DialogTitle className="dialog-title">
          Change Game
        <IconButton
          aria-label="close"
          className="dialog-close-btn"
          onClick={() => setIsChangeGameModalOpen(false)}
        >
          <XIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="input-group">
            <label>Game Name</label>
            <select
              {...register("gameName")}
              className={`input-field ${errors.gameName ? "error" : ""}`}
              defaultValue=""
            >
              <option value="" disabled>
                Select Game
              </option>

              {games
                .filter((game) => game.name !== selectedGame)
                .map((game) => (
                  <option key={game.name} value={game.name}>
                    {game.name}
                  </option>
                ))}

            </select>
            {errors.gameName && (
              <p className="error-message">{errors.gameName.message}</p>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Changing" : "Change"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default ChangeGameModal;
