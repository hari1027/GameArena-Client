/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import type {
  SevenCard,
  SevenCardChallengeGameDetails,
} from "../../Utils/Seven Card Challenge";
import type { Room } from "../../Utils/LobbyDetails";
import "./sevenCardChallenge.css";
import Card from "./Card";
import TurnTimer from "../TurnTimer";

interface SevenCardChallengeProps {
  roomDetails: Room | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  sevenCardChallengeGameDetails: SevenCardChallengeGameDetails | null;
  localLeaveRoom: () => void;
}

const SevenCardChallenge = ({
  roomDetails,
  socketState,
  sevenCardChallengeGameDetails,
  localLeaveRoom
}: SevenCardChallengeProps) => {
  const username = sessionStorage.getItem("username");
  const [playedCards, setPlayedCards] = useState<SevenCard[]>([]);
  const [cardsAddedToDiscardPile, setCardsAddedToDiscardPile] =
    useState<boolean>(false);
  const [resetTimer, setResetTimer] = useState(false);

  if (!sevenCardChallengeGameDetails) return null;

  const {
    round,
    circleCount,
    players,
    playersHands,
    turn,
    discardTop,
    deckCount,
    jokerRankOfTheRound,
  } = sevenCardChallengeGameDetails;

    // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setResetTimer(true);
  }, [sevenCardChallengeGameDetails]);

  const finishTurn = (
    choice: "deck" | "discard" | null,
    selectedDiscardCard?: undefined | SevenCard,
  ) => {
    if (
      canPlay === false ||
      playedCards.length === 0 ||
      cardsAddedToDiscardPile === false
    ) {
      return;
    }

    const RANK_ORDER = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    const isJoker = (card: SevenCard, jokerRank: string) =>
      card.rank === "joker" || card.rank === jokerRank;

    // RULE 1 — same rank validation
    const isValidSameRankSet = (cards: SevenCard[], jokerRank: string) => {
      if (cards.length < 2) return false;

      const nonJokers = cards.filter((c) => !isJoker(c, jokerRank));

      if (nonJokers.length === 0) return true;

      const rank = nonJokers[0].rank;

      return nonJokers.every((c) => c.rank === rank);
    };

    // RULE 2 — sequence validation
    const isValidSequence = (cards: SevenCard[], jokerRank: string) => {
      if (cards.length < 3) return false;

      const nonJokers = cards.filter((c) => !isJoker(c, jokerRank));

      if (nonJokers.length === 0) return true;

      const suit = nonJokers[0].suit;

      // must be same suit
      if (!nonJokers.every((c) => c.suit === suit)) return false;

      const indices = nonJokers
        .map((c) => RANK_ORDER.indexOf(c.rank))
        .sort((a, b) => a - b);

      let jokerCount = cards.length - nonJokers.length;

      for (let i = 1; i < indices.length; i++) {
        const gap = indices[i] - indices[i - 1] - 1;

        if (gap > jokerCount) return false;

        jokerCount -= gap;
      }

      return true;
    };

    // MASTER validation
    const isValidPlay = (cards: SevenCard[], jokerRank: string) => {
      return (
        isValidSameRankSet(cards, jokerRank) ||
        isValidSequence(cards, jokerRank)
      );
    };

    if (
      playedCards.length > 1 &&
      jokerRankOfTheRound &&
      jokerRankOfTheRound !== null &&
      jokerRankOfTheRound.rank &&
      jokerRankOfTheRound.suit
    ) {
      if (!isValidPlay(playedCards, jokerRankOfTheRound.rank)) {
        alert("Invalid cards combination");
        setCardsAddedToDiscardPile(false);
        return;
      }
    }

    socketState?.emit("scc_play", {
      roomId: roomDetails?.roomId,
      playerId: username,
      cards: playedCards,
      drawChoice: choice,
      selectedDiscardCard: selectedDiscardCard,
    });

    setPlayedCards([]);
    setCardsAddedToDiscardPile(false);
    setResetTimer(false);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const myCards = useMemo(() => {
    if (!playersHands || !username) return [];

    return playersHands[username] ?? [];
  }, [playersHands, username]);

  const canPlay = turn === username;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (
      canPlay &&
      cardsAddedToDiscardPile &&
      playedCards.length > 0 &&
      discardTop &&
      discardTop.length > 0 &&
      playedCards.some((playedCard) =>
        discardTop.some((discardCard) => discardCard.rank === playedCard.rank),
      )
    ) {
      finishTurn(null);
    }
  }, [playedCards, discardTop, cardsAddedToDiscardPile]);

  const handleCheckboxChange = (card: SevenCard, checked: boolean) => {
    if (checked) {
      setPlayedCards((prev) => [...prev, card]);
    } else {
      setPlayedCards((prev) =>
        prev.filter((c) => !(c.rank === card.rank && c.suit === card.suit)),
      );
    }
  };

  return (
    <div className="sevenCard-app-container">
      <div className="sevenCard-scroll-wrapper">
        <h3 style={{ paddingLeft: "10px" }}>Round - {round}</h3>
        <table className="sevenCard-players-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>OverAll Score</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.totalPoints}</td>
                <td>{p.handCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sevenCard-center-area">
          {jokerRankOfTheRound &&
            jokerRankOfTheRound.suit &&
            jokerRankOfTheRound.rank &&
            jokerRankOfTheRound !== null && (
              <div className="sevenCard-panel">
                <h3>
                  Joker Card -{" "}
                  {`${jokerRankOfTheRound.rank} of ${jokerRankOfTheRound.suit}`}
                </h3>
                <Card
                  key={`${jokerRankOfTheRound.rank} - ${jokerRankOfTheRound.suit}`}
                  rank={jokerRankOfTheRound.rank}
                  suit={jokerRankOfTheRound.suit}
                  displayValue={`${jokerRankOfTheRound.rank} - ${jokerRankOfTheRound.suit}`}
                />
              </div>
            )}

          <div
            className="sevenCard-panel sevenCard-clickable"
            onClick={() => {
              if (playedCards.length > 0 && cardsAddedToDiscardPile) {
                finishTurn("deck");
              }
            }}
          >
            <h3>Deck Card Count - {deckCount}</h3>
            <Card
              key="7-card-challenge"
              rank=""
              suit=""
              displayValue="7-card-challenge"
            />
          </div>

          <div
            className={`sevenCard-panel sevenCard-discard ${canPlay && !cardsAddedToDiscardPile ? "active" : ""} ${playedCards.length > 0 ? "sevenCard-clickable" : "sevenCard-nonclickable" }`}
            onClick={() => {
              if (canPlay && !cardsAddedToDiscardPile && playedCards.length > 0) {
                setCardsAddedToDiscardPile(true);
              }
            }}
          >
            <h3>Click here to Discard the Selected Cards</h3>

            <div className="sevenCard-deck-row-withnames">
              {playedCards &&
                playedCards.length > 0 &&
                playedCards.map((card: any, i: number) => (
                  <div key={i}>
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

          <div className="sevenCard-panel sevenCard-clickable">
            <h3>Pick a Single Card from Top Discarded Cards for you</h3>
            <div className="sevenCard-deck-row-withnames">
              {discardTop &&
                discardTop.length > 0 &&
                discardTop.map((card: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (playedCards.length > 0 && cardsAddedToDiscardPile) {
                        finishTurn("discard", card);
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
        </div>
      </div>

      <div className="sevenCard-bottom-deck-wrapper">
        <TurnTimer canPlay={canPlay} leaveRoom={localLeaveRoom} resetTimer={resetTimer} />
        <div className="sevenCard-deck-row">
          {myCards &&
            myCards !== null &&
            myCards.map((card: SevenCard, i: number) => {
              const isChecked = playedCards.some(
                (c) => c.rank === card.rank && c.suit === card.suit,
              );

              if (card.suit === undefined || card.rank === undefined) {
                return;
              }

              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => { 
                        if(canPlay && !cardsAddedToDiscardPile) {
                           handleCheckboxChange(card, e.target.checked)
                        }
                    }}
                    style={{cursor: (canPlay && !cardsAddedToDiscardPile) ? "pointer" : "not-allowed" }}
                  />

                  <Card
                    key={i}
                    rank={card.rank}
                    suit={card.suit}
                    displayValue={`${card.rank} - ${card.suit}`}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="sevenCard-action-bar">
        <button
          disabled={!canPlay || circleCount < 3 || playedCards.length !== 0}
          onClick={() =>
            socketState?.emit("scc_challenge", {
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

export default SevenCardChallenge;
