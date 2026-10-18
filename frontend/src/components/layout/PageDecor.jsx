import heroRight from "../../assets/home-hero-right.png";
import "./PageDecor.css";

function PageDecor() {
  return (
    <>
      <div className="page-decor-lamp" aria-hidden="true">
        <img src={heroRight} alt="" />
      </div>

      <div className="page-decor-motto" aria-hidden="true">
        <span>Eat</span>
        <span>Good</span>
        <span>Live</span>
        <span>Happy</span>
      </div>
    </>
  );
}

export default PageDecor;