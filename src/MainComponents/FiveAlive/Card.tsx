import './fiveAlive.css'

interface CardProps {
    type:string,
    displayValue:string,
    label:string,
}

const Card = ({ type, displayValue, label } : CardProps) => {
  return (
    <div className={`fiveAlive-card fiveAlive-card-${type}`}>
      <div className="fiveAlive-card-corner fiveAlive-top-left">{displayValue}</div>
      <div className="fiveAlive-card-center">
        <span className="fiveAlive-card-symbol">{displayValue}</span>
        {label && <span className="fiveAlive-card-label">{label}</span>}
      </div>
      <div className="fiveAlive-card-corner fiveAlive-bottom-right">{displayValue}</div>
    </div>
  );
};

export default Card;
