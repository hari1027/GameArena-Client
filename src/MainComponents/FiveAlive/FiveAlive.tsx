/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { GameCards, type FiveAliveGameDetails } from "../../Utils/Five Alive";
import type { Room } from "../../Utils/LobbyDetails";
import Card from "./Card";
import "./fiveAlive.css";
import TurnTimer from "../TurnTimer";

interface FiveAliveProps {
  roomDetails: Room | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  fiveAliveGameDetails: FiveAliveGameDetails | null;
  localLeaveRoom: () => void;
}

const FiveAlive = ({
  roomDetails,
  socketState,
  fiveAliveGameDetails,
  localLeaveRoom,
}: FiveAliveProps) => {
  const username = sessionStorage.getItem("username");
  const [playedCard, setPlayedCard] = useState<any | null>(null);
  const [resetTimer, setResetTimer] = useState(false);
  if (!fiveAliveGameDetails) return null;

  const {
    players,
    cardsList,
    score,
    deckCount,
    discardCount,
    lastDiscardedCard,
    currentTurn,
  } = fiveAliveGameDetails;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setResetTimer(true);
  }, [fiveAliveGameDetails]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const myCards = useMemo(() => {
    const player = cardsList.find((p: any) => p.username === username);
    if (!player) return [];

    return player.cards
      .map((engineCard: any) => {
        const key =
          engineCard.type === "number" ? engineCard.value : engineCard.power;

        return GameCards.find((c) => c.actualValue === key);
      })
      .filter(Boolean);
  }, [cardsList, username]);

  const canPlay = currentTurn === username && !playedCard;

  const playCard = (card: any, index: number) => {
    if (!canPlay) return;

    setPlayedCard(card);

    socketState.emit("fivealive_play_card", {
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setPlayedCard(null);
  }, [lastDiscardedCard]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const serverDiscardCard = useMemo(() => {
    if (lastDiscardedCard === null || lastDiscardedCard === undefined) {
      return null;
    }

    return GameCards.find(
      (c) => String(c.actualValue) === String(lastDiscardedCard),
    );
  }, [lastDiscardedCard]);

  const discardCardToShow =
    playedCard !== null ? playedCard : serverDiscardCard;

  return (
    <div className="fiveAlive-app-container">
      <div className="fiveAlive-scroll-wrapper">
        <table className="fiveAlive-players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Lives</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.username} className={(currentTurn === p.username) ? "fiveAlive-background-green" : ""}>
                <td>{p.username}</td>
                <td>{p.lives}</td>
                <td>{p.cardsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="fiveAlive-center-area">
          <div className="fiveAlive-panel">
            <h3>Deck Card Count - {deckCount}</h3>
            <Card
              key="Five-Alive"
              type="Five-Alive"
              displayValue=""
              label="Five Alive"
              //actualValue=""
            />
          </div>

          <div
            className={`fiveAlive-panel fiveAlive-discard ${canPlay ? "active" : ""}`}
            onDrop={onDrop}
            onDragOver={allowDrop}
          >
            <h3>Discard Cards Count - {discardCount} </h3>
            {discardCardToShow && discardCardToShow !== null && (
              <Card {...discardCardToShow} />
            )}
          </div>

          <div className="fiveAlive-panel">
            <h3>Current Count - {score}</h3>
          </div>
        </div>
      </div>

      <div className="fiveAlive-bottom-deck-wrapper">
        <TurnTimer
          canPlay={canPlay}
          leaveRoom={localLeaveRoom}
          resetTimer={resetTimer}
        />
        <div className="fiveAlive-deck-row">
          {myCards.map((card: any, i: number) => (
            <div
              key={i}
              draggable={canPlay}
              onDragStart={onDragStart(card, i)}
              onDoubleClick={() => playCard(card, i)}
            >
              <Card
                key={card.type}
                type={card.type}
                displayValue={card.displayValue}
                label={card.label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiveAlive;
