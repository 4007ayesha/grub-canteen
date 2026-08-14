import "./Button.css";
function Button({ children, variant = "primary", type = "button", onClick }) {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
