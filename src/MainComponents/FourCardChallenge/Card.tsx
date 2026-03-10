import './fourCardChallenge.css';

interface CardProps {
    rank:string,
    suit:string,
    displayValue:string,
}

const Card = ({ rank, suit, displayValue }: CardProps) => {
  return (
    <div className={`fourCard-card fourCard-suit-${suit}`}>
      <div className="fourCard-card-corner fourCard-top-left">{suit}</div>

      <div className="fourCard-card-center">
        <span className= {displayValue === "4-card-challenge" ? "fourCard-card-symbol-4-card" : "fourCard-card-symbol"}>{displayValue}</span>
      </div>

      <div className="fourCard-card-corner fourCard-bottom-right">{rank}</div>
    </div>
  );
};


export default Card;
