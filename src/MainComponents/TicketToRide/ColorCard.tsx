// ColorCard.tsx
// Displays a single train-car color card.
// Locomotive gets a rainbow gradient; all others get their solid color.

import React from "react";
import type { CardColor } from "../../Utils/Ticket To Ride";

interface CardStyle {
  bg: string;
  border: string;
  text: string;
  rainbow?: boolean;
}

const CARD_STYLES: Record<string, CardStyle> = {
  red:        { bg: "#c0392b", border: "#7b241c", text: "#fff" },
  blue:       { bg: "#2471a3", border: "#1a5276", text: "#fff" },
  green:      { bg: "#1e8449", border: "#145a32", text: "#fff" },
  yellow:     { bg: "#d4ac0d", border: "#9a7d0a", text: "#1a1a1a" },
  black:      { bg: "#1c1c1c", border: "#000",    text: "#e0e0e0" },
  white:      { bg: "#f0ece0", border: "#bbb",    text: "#333" },
  pink:       { bg: "#d63384", border: "#a0236a", text: "#fff" },
  orange:     { bg: "#d35400", border: "#a04000", text: "#fff" },
  locomotive: {
    bg: "linear-gradient(135deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6,#e74c3c)",
    border: "#555",
    text: "#fff",
    rainbow: true,
  },
};

interface TrainSvgProps {
  textColor: string;
}

function TrainSvg({ textColor }: TrainSvgProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 80 44"
      xmlns="http://www.w3.org/2000/svg"
      className="ttr-color-card__train-svg"
    >
      {/* body */}
      <rect x="4" y="10" width="62" height="20" rx="5"
        fill="none" stroke={textColor} strokeWidth="2.5" opacity="0.7" />
      {/* cab */}
      <rect x="52" y="5" width="14" height="13" rx="3"
        fill="none" stroke={textColor} strokeWidth="2" opacity="0.7" />
      {/* window */}
      <rect x="55" y="8" width="8" height="6" rx="1"
        fill={textColor} opacity="0.3" />
      {/* chimney */}
      <rect x="10" y="3" width="7" height="9" rx="2"
        fill="none" stroke={textColor} strokeWidth="2" opacity="0.6" />
      {/* wheels */}
      <circle cx="18" cy="32" r="6" fill="none" stroke={textColor} strokeWidth="2.5" opacity="0.7" />
      <circle cx="36" cy="32" r="6" fill="none" stroke={textColor} strokeWidth="2.5" opacity="0.7" />
      <circle cx="54" cy="32" r="6" fill="none" stroke={textColor} strokeWidth="2.5" opacity="0.7" />
      {/* axle */}
      <line x1="18" y1="32" x2="54" y2="32" stroke={textColor} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

interface ColorCardProps {
  color: CardColor | string;
  count?: number;
  small?: boolean;
}

const ColorCard = ({ color, count, small = false }: ColorCardProps) => {
  const style: CardStyle = CARD_STYLES[color] ?? { bg: "#888", border: "#555", text: "#fff" };

  return (
    <div
      className={`ttr-color-card${small ? " ttr-color-card--small" : ""}`}
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="ttr-color-card__inner">
        <TrainSvg textColor={style.text} />
        <span className="ttr-color-card__name" style={{ color: style.text }}>
          {color === "locomotive" ? "LOCO" : color.toUpperCase()}
        </span>
        {count !== undefined && count > 0 && (
          <span className="ttr-color-card__count" style={{ color: style.text }}>
            ×{count}
          </span>
        )}
      </div>
    </div>
  );
}

export default ColorCard;