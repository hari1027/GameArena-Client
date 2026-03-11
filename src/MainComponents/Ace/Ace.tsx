/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Room } from "../../Utils/LobbyDetails";
import Card from "./Card";
import "./ace.css";
import type { AceGameDetails } from "../../Utils/Ace";
import TurnTimer from "../TurnTimer";
import type { SnackbarHandle } from "../../GlobalSnackbar";
import GlobalSnackbar from "../../GlobalSnackbar";

interface AceProps {
  roomDetails: Room | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  aceGameDetails: AceGameDetails | null;
  localLeaveRoom: () => void;
}

const Ace = ({ roomDetails, socketState, aceGameDetails, localLeaveRoom }: AceProps) => {
  const username = sessionStorage.getItem("username");
  const [playedCard, setPlayedCard] = useState<any | null>(null);
  const [resetTimer, setResetTimer] = useState(false);
   const snackbarRef = useRef<SnackbarHandle>(null);

  if (!aceGameDetails) return null;

  const { players, cardsList, currentTurn, roundSuit, roundCards } =
    aceGameDetails;

   // eslint-disable-next-line react-hooks/rules-of-hooks
   useEffect(() => {
    setResetTimer(true)
  }, [aceGameDetails]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const myCards = useMemo(() => {
    const player = cardsList.find((p: any) => p.username === username);
    if (!player) return [];
    return player.cards;
  }, [cardsList, username]);

  const canPlay = currentTurn === username && !playedCard;

  const playCard = (card: any, index: number) => {
    if (!canPlay) return;

    // ✅ follow-suit validation
    if (roundSuit !== null && card.suit !== roundSuit) {
      const hasRoundSuitCard = myCards.some((c: any) => c.suit === roundSuit);

      if (hasRoundSuitCard) {
        //alert("Illegal move: You must follow the round suit");
        snackbarRef.current?.showNotification("Illegal move: You must follow the round suit", "error");
        return;
      }
    }

    setPlayedCard(card);

    socketState.emit("ace_play_card", {
      roomId: roomDetails?.roomId,
      playerId: username,
      cardIndex: index,
    });

    setPlayedCard(null);
    setResetTimer(false);
  };

  const onDragStart = (card: any, index: number) => (e: React.DragEvent) => {
    if (!canPlay) return e.preventDefault();
    e.dataTransfer.setData("card", JSON.stringify({ card, index }));
  };

  const onDrop = (e: React.DragEvent) => {
    if (!canPlay) return;

    const data = JSON.parse(e.dataTransfer.getData("card"));
    playCard(data.card, data.index);
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="ace-app-container">
      <div className="ace-scroll-wrapper">
        <table className="ace-players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.username} className={(currentTurn === p.username) ? "ace-background-green" : ""}>
                <td>{p.username}</td>
                <td>{p.cardsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ace-center-area">
          <div className="ace-panel ace-clickable">
            <h3>Round Info</h3>
            <div className="ace-deck-row-with-names">
              {roundCards &&
                roundCards.length > 0 &&
                roundCards.map((info: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "center",
                    }}
                  >
                    <Card
                      key={i}
                      rank={info.card.rank}
                      suit={info.card.suit}
                      displayValue={`${info.card.rank} - ${info.card.suit}`}
                    />
                    <div> {info.playerId} </div>
                  </div>
                ))}
            </div>
          </div>

          <div
            className={`ace-panel ace-discard ${canPlay ? "active" : ""}`}
            onDrop={onDrop}
            onDragOver={allowDrop}
          >
            <h3>Discard Here</h3>
            {playedCard && playedCard !== null && (
              <Card
                key={`${playedCard.rank} - ${playedCard.suit}`}
                rank={playedCard.rank}
                suit={playedCard.suit}
                displayValue={`${playedCard.rank} - ${playedCard.suit}`}
              />
            )}
          </div>
        </div>
      </div>

      <div className="ace-bottom-deck-wrapper">
        <TurnTimer canPlay={canPlay} leaveRoom={localLeaveRoom} resetTimer={resetTimer} />
        <div className="ace-deck-row">
          {myCards.map((card: any, i: number) => (
            <div
              key={i}
              draggable={canPlay}
              onDragStart={onDragStart(card, i)}
              onDoubleClick={() => playCard(card, i)}
            >
              <Card
                key={i}
                rank={card.rank}
                suit={card.suit}
                displayValue={`${card.rank} - ${card.suit}`}
              />
            </div>
          ))}
        </div>
      </div>
      <GlobalSnackbar ref={snackbarRef} />
    </div>
  );
};

export default Ace;
