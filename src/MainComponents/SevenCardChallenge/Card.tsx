import "./sevenCardChallenge.css";

interface CardProps {
    rank:string,
    suit:string,
    displayValue:string,
}

const Card = ({ rank, suit, displayValue }: CardProps) => {
  return (
    <div className={`sevenCard-card sevenCard-suit-${suit}`}>
      <div className="sevenCard-card-corner sevenCard-top-left">{suit}</div>

      <div className="sevenCard-card-center">
        <span className= {displayValue === "7-card-challenge" ? "sevenCard-card-symbol-7-card" : "sevenCard-card-symbol"}>{displayValue}</span>
      </div>

      <div className="sevenCard-card-corner sevenCard-bottom-right">{rank}</div>
    </div>
  );
};


export default Card;
