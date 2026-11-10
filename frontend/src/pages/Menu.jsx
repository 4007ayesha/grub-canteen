import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMenuItems, getCategories } from "../api";
import { useCart } from "../context/CartContext";
import usePopularItems from "../hooks/usePopularItems";
import { playAddSound, playRemoveSound } from "../utils/sound";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import heroRight from "../assets/home-hero-right.png";
import "./Menu.css";

function Squiggle() {
  return (
    <svg
      className="menu-squiggle"
      width="18"
      height="28"
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

function PlusIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function isOutOfStock(item) {
  return !item.available || item.current_stock === 0;
}

function hasStockLimit(item) {
  return item.current_stock !== undefined && item.current_stock !== null;
}

function stop(e) {
  e.preventDefault();
  e.stopPropagation();
}

function Menu() {
  const { cart, addToCart, updateQuantity } = useCart();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    getMenuItems()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      });
  }, []);

  // top sellers, taken from the same ranking as the admin "Popular Items" chart
  const popularPicks = usePopularItems(items, 4);

  function quantityOf(itemId) {
    const entry = cart.find((c) => c.id === itemId);
    return entry ? entry.quantity : 0;
  }

  function handleAdd(e, item) {
    stop(e);
    addToCart(item);
    playAddSound();
  }

  function handleChange(e, item, newQuantity) {
    stop(e);

    const current = quantityOf(item.id);

    if (
      newQuantity > current &&
      hasStockLimit(item) &&
      newQuantity > item.current_stock
    ) {
      return;
    }

    updateQuantity(item.id, newQuantity);

    if (newQuantity > current) {
      playAddSound();
    } else {
      playRemoveSound();
    }
  }

  const visibleItems =
    selectedCategory === null
      ? items
      : items.filter((item) => item.category_id === selectedCategory);

  const dataReady = !loading && !error;

  return (
    <div className="menu-page">
      {/* decorations (reuse existing assets) */}
      <div className="menu-decor menu-decor-lamp" aria-hidden="true">
        <img src={heroRight} alt="" />
      </div>
      <div className="menu-motto" aria-hidden="true">
        <span>Eat</span>
        <span>Good</span>
        <span>Live</span>
        <span>Happy</span>
      </div>

      <section className="menu-section">
        <div className="menu-section-header">
          <h2>
            <Squiggle />
            Popular Picks
          </h2>
        </div>

        {loading && <p className="menu-status">Loading menu...</p>}
        {!loading && error && <p className="menu-error">{error}</p>}
        {dataReady && items.length === 0 && (
          <p className="menu-status">No food items found.</p>
        )}

        {dataReady && popularPicks.length > 0 && (
          <div className="menu-popular-grid">
            {popularPicks.map((item) => (
              <Link
                key={item.id}
                to={`/food/${item.id}`}
                className="menu-item-link"
              >
                <Card className="menu-popular-card">
                  <div className="menu-tile-image">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} />
                    )}
                  </div>
                  <p className="menu-popular-name">{item.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="menu-categories menu-section">
        <button
          type="button"
          className={`menu-chip ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`menu-chip ${
              selectedCategory === cat.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <section className="menu-section">
        <div className="menu-section-header">
          <h2>
            <Squiggle />
            All Menu Items
          </h2>
        </div>

        {dataReady && items.length > 0 && visibleItems.length === 0 && (
          <p className="menu-status">No food items found.</p>
        )}

        {dataReady && visibleItems.length > 0 && (
          <div className="menu-grid">
            {visibleItems.map((item) => {
              const quantity = quantityOf(item.id);
              const atMax =
                hasStockLimit(item) && quantity >= item.current_stock;

              return (
                <Link
                  key={item.id}
                  to={`/food/${item.id}`}
                  className="menu-item-link"
                >
                  <Card
                    className={`menu-grid-card ${
                      quantity > 0 ? "in-cart" : ""
                    }`}
                  >
                    <div className="menu-tile-image">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} />
                      )}
                    </div>

                    <div className="menu-grid-body">
                      <h3 className="menu-grid-name">{item.name}</h3>
                      {item.description && (
                        <p className="menu-grid-desc">{item.description}</p>
                      )}
                    </div>

                    <div className="menu-grid-footer">
                      <strong className="menu-grid-price">
                        ₹{item.price}
                      </strong>

                      {isOutOfStock(item) ? (
                        <Badge variant="warning">Out of stock</Badge>
                      ) : quantity === 0 ? (
                        <button
                          type="button"
                          className="menu-add-btn"
                          onClick={(e) => handleAdd(e, item)}
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <PlusIcon />
                        </button>
                      ) : (
                        <div className="menu-stepper" onClick={stop}>
                          <button
                            type="button"
                            className="menu-step-btn"
                            onClick={(e) =>
                              handleChange(e, item, quantity - 1)
                            }
                            aria-label={`Remove one ${item.name}`}
                          >
                            <MinusIcon size={14} />
                          </button>

                          <span className="menu-step-qty">{quantity}</span>

                          <button
                            type="button"
                            className="menu-step-btn"
                            onClick={(e) =>
                              handleChange(e, item, quantity + 1)
                            }
                            disabled={atMax}
                            aria-label={`Add one more ${item.name}`}
                          >
                            <PlusIcon size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Menu;