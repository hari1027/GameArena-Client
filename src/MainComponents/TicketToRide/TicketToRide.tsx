import React, { useEffect, useRef, useState, useMemo } from "react";
import type { Room } from "../../Utils/LobbyDetails";
import TurnTimer from "../TurnTimer";
import type { SnackbarHandle } from "../../GlobalSnackbar";
import GlobalSnackbar from "../../GlobalSnackbar";
import ColorCard from "./ColorCard";
import TicketCard from "./TicketCard";
import IndianBoard from "./IndianBoard";
import {
  type TicketToRideGameDetails,
  type Route,
  type Ticket,
  type CardColor,
} from "../../Utils/Ticket To Ride";
import "./ticketToRide.css";

const ALL_CARD_COLORS: CardColor[] = [
  "red","blue","green","yellow","black","white","pink","orange","locomotive",
];

function countHand(hand: Array<{ color: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of hand) counts[c.color] = (counts[c.color] ?? 0) + 1;
  return counts;
}

interface CardEntry { color: string; count: number; }

interface TicketToRideProps {
  roomDetails: Room | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socketState: any;
  ticketToRideGameDetails: TicketToRideGameDetails | null;
  localLeaveRoom: () => void;
}

const TicketToRide = ({
  roomDetails, socketState, ticketToRideGameDetails, localLeaveRoom,
}: TicketToRideProps) => {
  const username   = sessionStorage.getItem("username") ?? "";
  const snackRef   = useRef<SnackbarHandle>(null);
  const [resetTimer, setResetTimer] = useState<boolean>(false);

  // ── Dialog visibility ──────────────────────────────────────────────────────
  const [showFaceUpDlg, setShowFaceUpDlg]  = useState<boolean>(false);
  const [showGrayDlg,   setShowGrayDlg]    = useState<boolean>(false);
  const [showMyInfoDlg, setShowMyInfoDlg]  = useState<boolean>(false);

  // ── Side panel mode ────────────────────────────────────────────────────────
  // "normal"         → default side panel
  // "initial_ticket" → inline initial ticket selection in side panel
  // "mid_ticket"     → inline mid-game ticket keep/discard in side panel
  type SideMode = "normal" | "initial_ticket" | "mid_ticket";
  const [sideMode, setSideMode] = useState<SideMode>("normal");

  // ── Selection state ────────────────────────────────────────────────────────
  const [faceUpSel,        setFaceUpSel]        = useState<number[]>([]);
  const [selectedRouteId,  setSelectedRouteId]  = useState<string | null>(null);
  const [pendingRoute,     setPendingRoute]      = useState<Route | null>(null);
  const [grayColor,        setGrayColor]         = useState<string>("");
  const [initDiscardIds,   setInitDiscardIds]    = useState<string[]>([]);
  const [ticketDiscardIds, setTicketDiscardIds]  = useState<string[]>([]);

  const emit = (ev: string, data: Record<string, unknown>): void => {
    setSelectedRouteId(null); // always clear map selection on any emit
    socketState?.emit(ev, { roomId: roomDetails?.roomId, playerId: username, ...data });
  };

  // Clear map selection on any action — moved into emit() itself so it's
  // impossible to forget. Keep clearMapSel() for non-emit UI actions.
  const clearMapSel = () => setSelectedRouteId(null);

  // Also clear map selection whenever side mode changes away from normal
  // (e.g. ticket pane opens) so highlighted routes don't linger
  useEffect(() => {
    if (sideMode !== "normal") setSelectedRouteId(null);
  }, [sideMode]);

  useEffect(() => { setResetTimer(true); }, [ticketToRideGameDetails]);

  if (!ticketToRideGameDetails) return null;

  const {
    phase,
     //initialSelectionSecondsLeft,
    players, currentTurn,
    ticketDeckCount, faceUpCards, routes, finalRound, finalScores, message,
  } = ticketToRideGameDetails;

  const isMyTurn  = currentTurn === username;
  const myPlayer  = players.find((p) => p.id === username);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const myHand    = myPlayer?.hand ?? [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const myCards   = useMemo<Record<string, number>>(() => countHand(myHand), [myHand]);
  const myColor   = myPlayer?.trainColor ?? "#8B0000";
  const pendingTix: Ticket[] = myPlayer?.pendingTickets ?? [];

  // ── Auto-switch side panel to ticket mode ──────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (
      phase === "initial_selection" &&
      myPlayer &&
      !myPlayer.initialSelectionDone &&
      pendingTix.length > 0 &&
      sideMode !== "initial_ticket"
    ) {
      setInitDiscardIds([]);
      setSideMode("initial_ticket");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, myPlayer?.initialSelectionDone, pendingTix.length]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (phase === "playing" && isMyTurn && pendingTix.length > 0 && sideMode !== "mid_ticket") {
      setTicketDiscardIds([]);
      setSideMode("mid_ticket");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTix.length, isMyTurn]);

  // Return to normal panel once tickets are resolved
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (pendingTix.length === 0 && (sideMode === "initial_ticket" || sideMode === "mid_ticket")) {
      setSideMode("normal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTix.length]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const canCallLastRound = useMemo<boolean>(() => {
    if (!myPlayer || finalRound) return false;
    if (myPlayer.trainsLeft === 0) return true;
    return !routes.filter((r) => !r.claimedBy).some((r) => r.length <= myPlayer.trainsLeft);
  }, [myPlayer, routes, finalRound]);

  // ── Face-up ────────────────────────────────────────────────────────────────
  const toggleFaceUp = (idx: number): void => {
    const card = faceUpCards[idx];
    if (!card) return;
    const isLoco = card.color === "locomotive";
    setFaceUpSel((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (isLoco) return [idx];
      if (prev.some((i) => faceUpCards[i]?.color === "locomotive")) return [idx];
      if (prev.length >= 2) return prev;
      return [...prev, idx];
    });
  };

  const openFaceUpDlg = () => {
    clearMapSel();
    setFaceUpSel([]);   // fresh state every open
    setShowFaceUpDlg(true);
  };

  const closeFaceUpDlg = () => {
    setFaceUpSel([]);   // clear any partial selection on close
    setShowFaceUpDlg(false);
  };

  const confirmFaceUp = (): void => {
    if (faceUpSel.length === 0) return;
    if (faceUpSel.some((i) => faceUpCards[i]?.color === "locomotive") && faceUpSel.length > 1) {
      snackRef.current?.showNotification("Locomotive must be taken alone", "error");
      return;
    }
    emit("ticket_take_cards", { source: "topPane", indices: faceUpSel });
    setFaceUpSel([]);
    setShowFaceUpDlg(false);
  };

  // ── Route selection ────────────────────────────────────────────────────────
  const handleRouteSelect = (routeId: string): void => {
    if (!isMyTurn) return;
    setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  // ── Build route ────────────────────────────────────────────────────────────
  const buildSelectedRoute = (): void => {
    if (!selectedRouteId || !isMyTurn) return;
    const route = routes.find((r) => r.id === selectedRouteId);
    if (!route) return;

    if (route.claimedBy) {
      snackRef.current?.showNotification("This route is already claimed", "error");
      return;
    }
    if (route.dualGroup) {
      const sibling = routes.find((r) => r.dualGroup === route.dualGroup && r.id !== route.id);
      if (sibling?.claimedBy === username) {
        snackRef.current?.showNotification("You already own the other lane of this dual route", "error");
        return;
      }
    }
    if (route.length > (myPlayer?.trainsLeft ?? 0)) {
      snackRef.current?.showNotification(
        `Need ${route.length} trains, you have ${myPlayer?.trainsLeft ?? 0}`, "error"
      );
      return;
    }

    if (route.color === "gray") {
      const locoCount     = myCards["locomotive"] ?? 0;
      const ferryLocos    = route.ferry ? (route.locosRequired ?? 0) : 0;
      const nonLocoNeeded = route.length - ferryLocos;
      const available: string[] = ALL_CARD_COLORS.filter((c) => {
        if (c === "locomotive") return false;
        const have = myCards[c] ?? 0;
        if (have === 0) return false;
        return Math.max(0, nonLocoNeeded - have) + ferryLocos <= locoCount;
      });
      if (locoCount >= route.length) available.push("_loco_only");
      if (available.length === 0) {
        snackRef.current?.showNotification("Not enough cards to build this route", "error");
        return;
      }
      if (available.length === 1) { doSendBuild(route, available[0]); return; }
      setPendingRoute(route);
      setGrayColor(available[0]);
      setShowGrayDlg(true);
    } else {
      doSendBuild(route, route.color);
    }
  };

  const doSendBuild = (route: Route, colorChoice: string): void => {
    const locoCount     = myCards["locomotive"] ?? 0;
    const ferryLocos    = route.ferry ? (route.locosRequired ?? 0) : 0;
    const needed        = route.length;
    const cardsToUse: CardEntry[] = [];

    if (colorChoice === "_loco_only") {
      cardsToUse.push({ color: "locomotive", count: needed });
    } else {
      const have          = myCards[colorChoice] ?? 0;
      const nonLocoNeeded = needed - ferryLocos;
      const colorUse      = Math.min(have, nonLocoNeeded);
      const locoUse       = needed - colorUse;
      if (locoUse > locoCount) {
        snackRef.current?.showNotification("Not enough locomotive cards", "error");
        return;
      }
      if (colorUse > 0) cardsToUse.push({ color: colorChoice, count: colorUse });
      if (locoUse  > 0) cardsToUse.push({ color: "locomotive", count: locoUse });
    }

    emit("ticket_build_route", { routeId: route.id, cardsToUse });
    setSelectedRouteId(null);
    setShowGrayDlg(false);
    setPendingRoute(null);
    setGrayColor("");
  };

  // Cancel gray dialog — clear all related state including map selection
  const cancelGrayDlg = () => {
    setShowGrayDlg(false);
    setPendingRoute(null);
    setGrayColor("");
    setSelectedRouteId(null); // remove the highlighted route on map too
  };

  // ── Ticket confirms ────────────────────────────────────────────────────────
  const confirmInitialTickets = (): void => {
    emit("ticket_discard_initial_tickets", { discardIds: initDiscardIds });
    setInitDiscardIds([]);
    setSideMode("normal");
  };

  const confirmMidGameTickets = (): void => {
    emit("ticket_keep_tickets", { discardIds: ticketDiscardIds });
    setTicketDiscardIds([]);
    setSideMode("normal");
  };

  const toggleId = (
    id: string,
    _list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ): void => {
    setList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const myTickets = myPlayer?.tickets ?? [];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const grayOptions = useMemo<string[]>(() => {
    if (!pendingRoute) return [];
    const locoCount   = myCards["locomotive"] ?? 0;
    const ferryLocos  = pendingRoute.ferry ? (pendingRoute.locosRequired ?? 0) : 0;
    const nonLocoNeed = pendingRoute.length - ferryLocos;
    const opts: string[] = ALL_CARD_COLORS.filter((c) => {
      if (c === "locomotive") return false;
      const have = myCards[c] ?? 0;
      if (have === 0) return false;
      return Math.max(0, nonLocoNeed - have) + ferryLocos <= locoCount;
    });
    if (locoCount >= pendingRoute.length) opts.push("_loco_only");
    return opts;
  }, [pendingRoute, myCards]);

  // ── Side panel: ticket pane ────────────────────────────────────────────────
  const renderTicketPane = () => {
    const isInitial = sideMode === "initial_ticket";
    const tickets   = pendingTix;
    const discardIds    = isInitial ? initDiscardIds   : ticketDiscardIds;
    const setDiscardIds = isInitial ? setInitDiscardIds : setTicketDiscardIds;
    const minKeep       = isInitial ? 2 : 1;
    const keepCount     = tickets.length - discardIds.length;

    return (
      <div className="ttr-ticket-pane">
        {/* Header */}
        <div className="ttr-ticket-pane__header">
          <span className="ttr-ticket-pane__title">
            {isInitial ? "Choose Starting Tickets" : "New Destination Tickets"}
          </span>
          {/* {isInitial && (
            <span className="ttr-ticket-pane__timer">⏱ {initialSelectionSecondsLeft}s</span>
          )} */}
        </div>

        <p className="ttr-ticket-pane__hint">
          {isInitial
            ? <>Keep at least <b>2</b>. Tap a ticket to mark it for discard.</>
            : <>Keep at least <b>1</b>. Tap a ticket to mark it for discard.</>
          }
        </p>

        {/* Ticket list */}
        <div className="ttr-ticket-pane__list">
          {tickets.map((t) => {
            const marked = discardIds.includes(t.id);
            return (
              <div
                key={t.id}
                className={`ttr-ticket-pane__item${marked ? " ttr-ticket-pane__item--discard" : ""}`}
                onClick={() => toggleId(t.id, discardIds, setDiscardIds)}
              >
                <TicketCard from={t.from} to={t.to} points={t.points}/>
                <div className="ttr-ticket-pane__item-badge">
                  {marked ? "✕ Discard" : "✓ Keep"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="ttr-ticket-pane__footer">
          {/* Back — lets player check board / face-up cards, then return */}
          <button
            className="ttr-btn ttr-btn--cancel ttr-btn--sm"
            onClick={() => setSideMode("normal")}
          >
            ← Back to panel
          </button>

          <button
            className="ttr-btn ttr-btn--primary"
            disabled={keepCount < minKeep}
            onClick={isInitial ? confirmInitialTickets : confirmMidGameTickets}
          >
            {keepCount < minKeep
              ? `Keep min ${minKeep}`
              : `Confirm — Keep ${keepCount}`
            }
          </button>
        </div>
      </div>
    );
  };

  // ── Side panel: normal content ─────────────────────────────────────────────
  const renderNormalPane = () => (
    <>
      {/* Title row */}
      <div className="ttr-side-title-row">
        <div className="ttr-header-left">
          <span className="ttr-title">India <em>1911</em></span>
          {finalRound && <span className="ttr-badge ttr-badge--final">⚠ LAST ROUND</span>}
        </div>
        <div className="ttr-timer-row ttr-timer-row--mobile">
          <TurnTimer canPlay={isMyTurn} leaveRoom={localLeaveRoom} resetTimer={resetTimer} gameName="Ticket To Ride"/>
        </div>
      </div>

      {/* Turn badge */}
      <div className="ttr-header-right">
        <span className={`ttr-badge ${isMyTurn ? "ttr-badge--myturn" : "ttr-badge--wait"}`}>
          {isMyTurn ? "YOUR TURN" : `${currentTurn ?? "—"}'s turn`}
        </span>
      </div>

      {/* Pending tickets banner — tap to go back to ticket pane */}
      {pendingTix.length > 0 && (
        <button
          className="ttr-btn ttr-btn--danger"
          onClick={() => setSideMode(phase === "initial_selection" ? "initial_ticket" : "mid_ticket")}
          style={{width:"100%", justifyContent:"center"}}
        >
          🎫 {pendingTix.length} ticket{pendingTix.length !== 1 ? "s" : ""} waiting — tap to decide
        </button>
      )}

      {/* Actions */}
      <div className="ttr-actions">
        <button
          className="ttr-btn ttr-btn--primary"
          disabled={!isMyTurn || pendingTix.length > 0 || phase !== "playing"}
          onClick={() => {
            clearMapSel();
            emit("ticket_take_cards", { source: "deck", indices: [] });
          }}
        >
          📦 Draw from Deck
        </button>

        <button
          className="ttr-btn ttr-btn--primary"
          disabled={!isMyTurn || pendingTix.length > 0 || phase !== "playing"}
          onClick={openFaceUpDlg}
        >
          🃏 Pick Face-Up Cards
        </button>

        <button
          className="ttr-btn ttr-btn--secondary"
          disabled={!isMyTurn || pendingTix.length > 0 || phase !== "playing" || ticketDeckCount === 0}
          onClick={() => { clearMapSel(); emit("ticket_take_ticket", {}); }}
        >
          🎫 Take Tickets
        </button>

        <button
          className="ttr-btn ttr-btn--danger"
          disabled={!isMyTurn || !canCallLastRound || finalRound || phase !== "playing"}
          onClick={() => { clearMapSel(); emit("ticket_call_last_round", {}); }}
        >
          🏁 Say Last Round
        </button>

        <button
          className="ttr-btn ttr-btn--info"
          onClick={() => { clearMapSel(); setShowMyInfoDlg(true); }}
        >
          🎟 My Tickets &amp; Color
        </button>
      </div>

      {/* Face-up cards */}
      <div className="ttr-section">
        <div className="ttr-section-title">Face-Up Cards</div>
        <div className="ttr-faceup-row">
          {faceUpCards.map((c, i) => <ColorCard key={i} color={c.color} small/>)}
        </div>
      </div>

      {/* My hand */}
      <div className="ttr-section">
        <div className="ttr-section-title">My Cards</div>
        <div className="ttr-hand-grid">
          {ALL_CARD_COLORS.map((c) => {
            const cnt = myCards[c] ?? 0;
            if (cnt === 0) return null;
            return <ColorCard key={c} color={c} count={cnt} small/>;
          })}
          {Object.values(myCards).every((v) => v === 0) && (
            <span className="ttr-empty-note">No cards yet</span>
          )}
        </div>
      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ttr-app">

      {/* COUNTDOWN */}
      {phase === "initial_selection" && (
        <div className="ttr-countdown">
          <span>Select starting tickets (Time Limit - 4 Min's , If Not Auto discard will happen) </span>
          {/* <span className="ttr-countdown-val">{initialSelectionSecondsLeft}s</span>
          <div className="ttr-countdown-bar">
            <div className="ttr-countdown-fill"
              style={{ width: `${(initialSelectionSecondsLeft / 100) * 100}%` }}/>
          </div> */}
        </div>
      )}

      {/* SCOREBOARD */}
      <div className="ttr-scoreboard">
        <div className="ttr-player-disp">
          {players.map((p) => (
            <div
              key={p.id}
              className={`ttr-player-chip${p.id === currentTurn ? " ttr-player-chip--active" : ""}`}
              style={{ borderColor: p.trainColor ?? "#555" }}
            >
              <span className="ttr-chip-dot" style={{ background: p.trainColor ?? "#555" }}/>
              <span className="ttr-chip-name">{p.id}</span>
              <span className="ttr-chip-trains">🚂 {p.trainsLeft}</span>
            </div>
          ))}
        </div>
        <div className="ttr-timer-row">
          <TurnTimer canPlay={isMyTurn} leaveRoom={localLeaveRoom} resetTimer={resetTimer} gameName="Ticket To Ride"/>
        </div>
      </div>

      {/* MAIN */}
      <div className="ttr-main">

        {/* BOARD */}
        <div className="ttr-board-panel">
          <IndianBoard
            routes={routes}
            onRouteSelect={handleRouteSelect}
            selectedRouteId={selectedRouteId}
            players={players}
            canInteract={isMyTurn && phase === "playing" && pendingTix.length === 0}
          />

          {/* Route action bar */}
          {selectedRouteId && (() => {
            const r = routes.find((rt) => rt.id === selectedRouteId);
            if (!r) return null;
            return (
              <div className="ttr-route-bar">
                <span className="ttr-route-bar__info">
                  <b>{r.from}</b> → <b>{r.to}</b>
                  <span className="ttr-route-bar__tag">

                    {r.ferry && r.locosRequired
                      ? `${r.length} Train${r.length > 1 ? "s" : ""} (${r.locosRequired} locomotive ${r.locosRequired > 1 ? "s" : ""} + ${r.length - r.locosRequired} ${r.color})`
                      : `${r.length} Train${r.length > 1 ? "s" : ""} of ${r.color}`
                    }

                  </span>
                </span>
                <div className="ttr-route-bar__btns">
                  <button className="ttr-btn ttr-btn--build" disabled={!isMyTurn} onClick={buildSelectedRoute}>
                    🔨 Build (If you dont have enough card/card's to build, your locomotive will be Used as Substitue)
                  </button>
                  <button className="ttr-btn ttr-btn--sm ttr-btn--cancel" onClick={clearMapSel}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* SIDE PANEL */}
        <div className="ttr-side">
          {(sideMode === "initial_ticket" || sideMode === "mid_ticket")
            ? renderTicketPane()
            : renderNormalPane()
          }
        </div>

      </div>

      {/* ── DIALOGS ──────────────────────────────────────────────────────── */}

      {/* Face-up card picker */}
      {showFaceUpDlg && (
        <div className="ttr-overlay" onClick={closeFaceUpDlg}>
          <div className="ttr-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ttr-dialog-title">Pick Face-Up Cards</div>
            <p className="ttr-dialog-hint">
              Select 1 locomotive <b>OR</b> 2 non-locomotive cards, then tap OK.
            </p>
            <div className="ttr-faceup-picker">
              {faceUpCards.map((card, i) => (
                <label
                  key={i}
                  className={`ttr-faceup-option${faceUpSel.includes(i) ? " ttr-faceup-option--sel" : ""}`}
                >
                  <input type="checkbox" checked={faceUpSel.includes(i)} onChange={() => toggleFaceUp(i)}/>
                  <ColorCard color={card.color}/>
                </label>
              ))}
            </div>
            <div className="ttr-dialog-footer">
              <button className="ttr-btn ttr-btn--cancel" onClick={closeFaceUpDlg}>
                ✕ Cancel
              </button>
              <button
                className="ttr-btn ttr-btn--primary"
                disabled={
                  faceUpSel.length === 0 ||
                  (!faceUpSel.some((i) => faceUpCards[i]?.color === "locomotive") && faceUpSel.length < 2)
                }
                onClick={confirmFaceUp}
              >
                OK — Take {faceUpSel.length} card{faceUpSel.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gray route color picker */}
      {showGrayDlg && pendingRoute && (
        <div className="ttr-overlay" onClick={cancelGrayDlg}>
          <div className="ttr-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ttr-dialog-title">Choose Card Color</div>
            <p className="ttr-dialog-hint">
              Gray route <b>{pendingRoute.from} → {pendingRoute.to}</b> ({pendingRoute.length} cars).
              Pick which color cards to use (If you choose a Color which is not Satisfying the count to build, your locomotive will be Used as Substitue):
            </p>
            <div className="ttr-gray-picker">
              {grayOptions.map((c) => (
                <label
                  key={c}
                  className={`ttr-faceup-option${grayColor === c ? " ttr-faceup-option--sel" : ""}`}
                >
                  <input type="radio" name="gray-color" value={c} checked={grayColor === c} onChange={() => setGrayColor(c)}/>
                  {c === "_loco_only"
                    ? <ColorCard color="locomotive" count={myCards["locomotive"] ?? 0}/>
                    : <ColorCard color={c} count={myCards[c] ?? 0}/>
                  }
                </label>
              ))}
            </div>
            <div className="ttr-dialog-footer">
              <button className="ttr-btn ttr-btn--cancel" onClick={cancelGrayDlg}>
                ✕ Cancel
              </button>
              <button
                className="ttr-btn ttr-btn--primary"
                disabled={!grayColor}
                onClick={() => pendingRoute && doSendBuild(pendingRoute, grayColor)}
              >
                Build Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My tickets + color */}
      {showMyInfoDlg && (
        <div className="ttr-overlay" onClick={() => setShowMyInfoDlg(false)}>
          <div className="ttr-dialog ttr-dialog--wide" onClick={(e) => e.stopPropagation()}>
            <div className="ttr-dialog-title">My Tickets &amp; Color Representation</div>
            <div className="ttr-color-rep">
              <span>Color Representation</span>
              <div className="ttr-color-swatch" style={{ background: myColor }}/>
              <span className="ttr-color-rep-label">Your train color on the board</span>
            </div>
            <div className="ttr-ticket-grid">
              {myTickets.map((t) => (
                <TicketCard
                  key={t.id} from={t.from} to={t.to} points={t.points}
                  completed={(t as Ticket & { completed?: boolean }).completed ?? null}
                  delta={(t as Ticket & { delta?: number }).delta ?? null}
                />
              ))}
              {myTickets.length === 0 && <span className="ttr-empty-note">No tickets yet</span>}
            </div>
            <div className="ttr-dialog-footer">
              <button className="ttr-btn ttr-btn--primary" onClick={() => setShowMyInfoDlg(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {phase === "game_over" && finalScores && (
        <div className="ttr-overlay">
          <div className="ttr-dialog ttr-dialog--wide ttr-dialog--gameover">
            <div className="ttr-dialog-title ttr-dialog-title--big">🏆 Game Over</div>
            <p className="ttr-gameover-msg">{message}</p>
            <div className="ttr-final-list">
              {finalScores.map((fs, i) => (
                <div
                  key={fs.playerId}
                  className={`ttr-final-row${i === 0 ? " ttr-final-row--winner" : ""}`}
                  style={{ borderLeftColor: fs.trainColor ?? "#888" }}
                >
                  <span className="ttr-final-rank">#{i + 1}</span>
                  <span className="ttr-chip-dot" style={{
                    background: fs.trainColor ?? "#888",
                    width:12, height:12, borderRadius:"50%",
                    display:"inline-block", flexShrink:0,
                  }}/>
                  <span className="ttr-final-name">{fs.playerId}</span>
                  <span className="ttr-final-score">{fs.score} pts</span>
                  <span className="ttr-final-build">(routes: {fs.buildScore})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <GlobalSnackbar ref={snackRef}/>
    </div>
  );
};

export default TicketToRide;