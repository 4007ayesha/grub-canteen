import heroRight from "../../assets/home-hero-right.png";
import { Squiggle } from "./Decor";
import "./AdminPage.css";

function AdminPage({ children, lamp = true }) {
  return (
    <div className="adm-page">
      {lamp && (
        <div className="adm-lamp" aria-hidden="true">
          <img src={heroRight} alt="" />
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminPageHeader({ title, subtitle }) {
  return (
    <div className="adm-header">
      <h1>
        <Squiggle size={34} />
        {title}
        <Squiggle size={34} flip />
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default AdminPage;