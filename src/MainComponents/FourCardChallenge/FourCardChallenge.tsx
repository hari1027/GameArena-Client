/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { FourCardChallengeGameDetails } from "../../Utils/Four Card Challenge";
import type { Room } from "../../Utils/LobbyDetails";
import "./fourCardChallenge.css";
import Card from "./Card";
import TurnTimer from "../TurnTimer";

interface FourCardChallengeProps {
  roomDetails: Room | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  fourCardChallengeGameDetails: FourCardChallengeGameDetails | null;
  localLeaveRoom: () => void;
}

const FourCardChallenge = ({
  roomDetails,
  socketState,
  fourCardChallengeGameDetails,
  localLeaveRoom,
}: FourCardChallengeProps) => {
  const username = sessionStorage.getItem("username");
  const [playedCard, setPlayedCard] = useState<any | null>(null);
  const [resetTimer, setResetTimer] = useState(false);
  const [showPickCardBoxes, setShowPickCardBoxes] = useState(false);
  const [continueTimer, setContinueTimer] = useState(false);

  if (!fourCardChallengeGameDetails) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setResetTimer(true);
    setShowPickCardBoxes(false);
  }, [fourCardChallengeGameDetails]);

  const {
    round,
    circleCount,
    players,
    playersHands,
    turn,
    discardTop,
    deckCount,
  } = fourCardChallengeGameDetails;

  const finishTurn = (choice: "deck" | "discard" | null) => {
    if (playedCard === null) return;

    socketState?.emit("fcc_play", {
      roomId: roomDetails?.roomId,
      playerId: username,
      card: playedCard,
      drawChoice: choice,
    });

    setContinueTimer(false)
    setPlayedCard(null);
    setResetTimer(false);
    setShowPickCardBoxes(false);
  };

  const onDragStart = (card: any) => (e: React.DragEvent) => {
    if (!canPlay || playedCard !== null) return e.preventDefault();
    e.dataTransfer.setData("card", JSON.stringify({ card }));
  };

  const onDrop = (e: React.DragEvent) => {
    if (!canPlay || playedCard !== null) return;

    const data = JSON.parse(e.dataTransfer.getData("card"));
    setContinueTimer(true)
    setPlayedCard(data.card);
    setShowPickCardBoxes(true)
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const myCards = useMemo(() => {
    if (!playersHands || !username) return [];

    return playersHands[username] ?? [];
  }, [playersHands, username]);

  const canPlay = turn === username && !playedCard;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (
      playedCard !== null &&
      discardTop &&
      playedCard.rank === discardTop.rank
    ) {
      finishTurn(null);
    }
  }, [playedCard, discardTop]);

  return (
    <div className="fourCard-app-container">
      <div className="fourCard-scroll-wrapper">
        <h3 style={{ paddingLeft: "10px" }}>Round - {round}</h3>
        <table className="fourCard-players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>OverAll Score</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className={(turn === p.id) ? "fourCard-background-green" : ""}>
                <td>{p.id}</td>
                <td>{p.totalPoints}</td>
                <td>{p.handCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="fourCard-center-area">
          <div
            className={showPickCardBoxes ? "fourCard-panel-active fourCard-clickable" : "fourCard-panel fourCard-notclickable"}
            onClick={() => finishTurn("deck")}
          >
            <h3>Deck Card Count - {deckCount}</h3>
            <Card
              key="4-card-challenge"
              rank=""
              suit=""
              displayValue="4-card-challenge"
            />
          </div>

          <div
            className={`fourCard-panel fourCard-discard ${canPlay ? "active" : ""}`}
            onDrop={onDrop}
            onDragOver={allowDrop}
          >
            <h3>Discard Here</h3>

            <div className="fourCard-selected-row">
              {playedCard !== null && (
                <Card
                  key={`${playedCard.rank} - ${playedCard.suit}`}
                  rank={playedCard.rank}
                  suit={playedCard.suit}
                  displayValue={`${playedCard.rank} - ${playedCard.suit}`}
                />
              )}
            </div>
          </div>

          <div
            className={showPickCardBoxes ? "fourCard-panel-active fourCard-clickable" : "fourCard-panel fourCard-notclickable"}
            onClick={() => finishTurn("discard")}
          >
            <h3>Top Discarded Card For You</h3>
            {discardTop && discardTop.rank && discardTop.suit && (
              <Card
                key={`${discardTop.rank} - ${discardTop.suit}`}
                rank={discardTop.rank}
                suit={discardTop.suit}
                displayValue={`${discardTop.rank} - ${discardTop.suit}`}
              />
            )}
          </div>
        </div>
      </div>

      <div className="fourCard-bottom-deck-wrapper">
        <TurnTimer
          canPlay={canPlay}
          leaveRoom={localLeaveRoom}
          resetTimer={resetTimer}
          continueTimer={continueTimer}
          gameName = "Four Card Challenge"
        />
        <div className="fourCard-deck-row">
          {myCards.map((card: any, i: number) => (
            <div
              key={i}
              draggable={canPlay}
              onDragStart={onDragStart(card)}
              onDoubleClick={() => {
                if (canPlay && playedCard === null) {
                  setContinueTimer(true)
                  setPlayedCard(card);
                  setShowPickCardBoxes(true)
                }
              }}
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

      <div className="fourCard-action-bar">
        <button
          disabled={!canPlay || circleCount < 3 || playedCard !== null}
          onClick={() =>
            socketState?.emit("fcc_challenge", {
              roomId: roomDetails?.roomId,
              playerId: username,
            })
          }
          style={{ cursor: "pointer" }}
        >
          Challenge
        </button>
      </div>
    </div>
  );
};

export default FourCardChallenge;
