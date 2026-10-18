import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import cornerTopLeft from "../assets/corner-top-left.png";
import cornerTopRight from "../assets/corner-top-right.png";
import cornerBottomLeft from "../assets/corner-bottom-left.png";
import cornerBottomRight from "../assets/corner-bottom-right.png";
import "./Splash.css";

function Splash() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(token ? "/home" : "/login", { replace: true });
    }, 2200);

    return () => clearTimeout(timer);
  }, [token, navigate]);

  return (
    <div className="splash-page">
      <img src={cornerTopLeft} alt="" className="splash-corner splash-corner-tl" />
      <img src={cornerTopRight} alt="" className="splash-corner splash-corner-tr" />
      <img src={cornerBottomLeft} alt="" className="splash-corner splash-corner-bl" />
      <img src={cornerBottomRight} alt="" className="splash-corner splash-corner-br" />

      <div className="splash-content">
        <img src={logo} alt="Grub Canteen" className="splash-logo" />

        <p className="splash-tagline">
          Good Food <span className="splash-heart">♥</span> Better Days
        </p>
      </div>
    </div>
  );
}

export default Splash;