import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenuItems } from "../api";
import Card from "../components/ui/Card";
import heroLeft from "../assets/home-hero-left.png";
import heroRight from "../assets/home-hero-right.png";
import "./Home.css";

// Edit this list to change what appears under "Season Special".
// Names are matched against your real menu items (case-insensitive, partial match).
const SEASON_SPECIAL_NAMES = ["idli", "vada", "pongal", "filter coffee"];

function Squiggle({ flip }) {
  return (
    <svg
      className={`home-squiggle ${flip ? "flip" : ""}`}
      width="26"
      height="40"
      viewBox="0 0 26 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="4" y1="6" x2="20" y2="10" />
      <line x1="2" y1="18" x2="18" y2="20" />
      <line x1="6" y1="32" x2="18" y2="26" />
    </svg>
  );
}

function ItemGrid({ items }) {
  return (
    <div className="home-popular-grid">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/food/${item.id}`}
          className="home-popular-link"
        >
          <Card className="home-popular-card">
            <div className="home-popular-image-wrap">
              {item.image_url && <img src={item.image_url} alt={item.name} />}
            </div>
            <p className="home-popular-name">{item.name}</p>
            <span className="home-popular-underline" />
          </Card>
        </Link>
      ))}
    </div>
  );
}

function Section({ title, items, showViewMenu }) {
  if (items.length === 0) return null;

  return (
    <section className="home-popular">
      <div className="home-section-header">
        <h2>
          <Squiggle />
          {title}
        </h2>

        {showViewMenu && (
          <Link to="/menu" className="home-view-menu">
            View Menu →
          </Link>
        )}
      </div>

      <ItemGrid items={items} />
    </section>
  );
}

function Home() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMenuItems()
      .then((data) => {
        setAllItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu items.");
        setLoading(false);
      });
  }, []);

  const popularPicks = allItems.slice(0, 4);

  const newInStock = [...allItems]
    .sort((a, b) => b.id - a.id)
    .filter(
      (item) =>
        item.current_stock === undefined ||
        item.current_stock === null ||
        item.current_stock > 0
    )
    .slice(0, 4);

  const seasonSpecial = SEASON_SPECIAL_NAMES.map((name) =>
    allItems.find((item) => item.name.toLowerCase().includes(name))
  )
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((i) => i.id === item.id) === index);

  return (
    <div className="home-page">
      <section className="home-hero">
        <img src={heroLeft} alt="" className="home-hero-art home-hero-art-left" />

        <div className="home-hero-center">
          <div className="home-hero-heading">
            <Squiggle />
            <h1>Welcome to our canteen</h1>
            <Squiggle flip />
          </div>

          <p className="home-hero-tagline">
            Good food <span className="home-heart">♥</span> Better days
          </p>

          <div className="home-hero-smile" />
        </div>

        <img src={heroRight} alt="" className="home-hero-art home-hero-art-right" />
      </section>

      {loading && <p className="home-status">Loading...</p>}
      {!loading && error && <p className="home-status home-error">{error}</p>}
      {!loading && !error && allItems.length === 0 && (
        <p className="home-status">No items available yet.</p>
      )}

      {!loading && !error && allItems.length > 0 && (
        <>
          <Section title="Popular Picks" items={popularPicks} showViewMenu />
          <Section title="New in Stock" items={newInStock} />
          <Section title="Season Special" items={seasonSpecial} />
        </>
      )}
    </div>
  );
}

export default Home;