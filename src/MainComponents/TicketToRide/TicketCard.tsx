// TicketCard.tsx
// Destination ticket card. Deep teal background — a color not used anywhere
// else in the application (distinct from all 8 card colors and player train colors).
// Shows: FROM city → TO city, point value.
// Optional completed / delta shown at game end.

interface TicketCardProps {
  from:       string;
  to:         string;
  points:     number;
  completed?: boolean | null;
  delta?:     number | null;
}

const TicketCard = ({
  from,
  to,
  points,
  completed = null,
  delta = null,
}: TicketCardProps) => {
  let statusClass = "";
  if (completed === true)  statusClass = " ttr-ticket-card--done";
  if (completed === false) statusClass = " ttr-ticket-card--fail";

  return (
    <div className={`ttr-ticket-card${statusClass}`}>
      <div className="ttr-ticket-card__header">
        <span className="ttr-ticket-card__pts">{points}</span>
        <span className="ttr-ticket-card__pts-label">pts</span>
      </div>
      <div className="ttr-ticket-card__route">
        <span className="ttr-ticket-card__city">{from}</span>
        <div className="ttr-ticket-card__track-line">
          <span className="ttr-ticket-card__track-dot" />
          <span className="ttr-ticket-card__track-dashes" />
          <span className="ttr-ticket-card__loco-icon">🚂</span>
          <span className="ttr-ticket-card__track-dashes" />
          <span className="ttr-ticket-card__track-dot" />
        </div>
        <span className="ttr-ticket-card__city">{to}</span>
      </div>
      {delta !== null && (
        <div
          className={`ttr-ticket-card__result ${
            delta >= 0 ? "ttr-ticket-card__result--pos" : "ttr-ticket-card__result--neg"
          }`}
        >
          {delta >= 0 ? `+${delta}` : delta}
        </div>
      )}
    </div>
  );
}

export default TicketCard;
