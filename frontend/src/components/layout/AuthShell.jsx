import logo from "../../assets/logo.png";
import doodlesLeft from "../../assets/login-doodles-left.png";
import doodlesRight from "../../assets/login-doodles-right.png";
import "./AuthShell.css";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <img
        src={doodlesLeft}
        alt=""
        className="auth-shell-doodle auth-shell-doodle-left"
      />
      <img
        src={doodlesRight}
        alt=""
        className="auth-shell-doodle auth-shell-doodle-right"
      />

      <div className="auth-shell-content">
        <img src={logo} alt="Grub Canteen" className="auth-shell-logo" />

        <h1 className="auth-shell-title">{title}</h1>
        {subtitle && <p className="auth-shell-subtitle">{subtitle}</p>}

        <div className="auth-shell-body">{children}</div>

        <div className="auth-shell-divider">
          <span />
          <span className="auth-shell-heart">♥</span>
          <span />
        </div>

        <p className="auth-shell-footer">
          Good Food <span className="auth-shell-heart">♥</span> Better Days
        </p>
      </div>
    </div>
  );
}

export default AuthShell;