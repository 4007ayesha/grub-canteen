import "./Input.css";

function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  required = false,
}) {
  return (
    <div className="ui-input-group">
      {label && <label htmlFor={name}>{label}</label>}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="ui-input"
      />
    </div>
  );
}

export default Input;
