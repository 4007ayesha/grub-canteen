import "./Card.css";

function Card({ children, className = "" }) {
  return (
    <div className={`ui-card ${className}`}>
      {children}
    </div>
  );
}

export default Card;