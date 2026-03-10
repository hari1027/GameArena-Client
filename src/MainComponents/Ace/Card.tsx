import './ace.css';

interface CardProps {
    rank:string,
    suit:string,
    displayValue:string,
}

const Card = ({ rank, suit, displayValue }: CardProps) => {
  return (
    <div className={`ace-card ace-suit-${suit}`}>
      <div className="ace-card-corner ace-top-left">{suit}</div>

      <div className="ace-card-center">
        <span className= "ace-card-symbol">{displayValue}</span>
      </div>

      <div className="ace-card-corner ace-bottom-right">{rank}</div>
    </div>
  );
};


export default Card;
