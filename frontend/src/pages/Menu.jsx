import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMenuItems, getCategories } from "../api";
import { useCart } from "../context/CartContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import "./Menu.css";

function Menu() {
  const { addToCart } = useCart();
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

    getMenuItems("", selectedCategory)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      });
  }, [selectedCategory]);

  function handleAddToCart(e, item) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);
  }

  return (
    <div className="menu-page">
      <p className="menu-subtitle">
        Choose your favorite food and place your order.
      </p>

      <div className="menu-categories">
        <button
          className={`menu-chip ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-chip ${
              selectedCategory === cat.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="menu-status">Loading menu...</p>}
      {!loading && error && <p className="menu-error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="menu-status">No food items found.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="menu-grid">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/food/${item.id}`}
              className="menu-item-link"
            >
              <Card className="menu-item-card">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="menu-item-image"
                  />
                )}

                <div className="menu-item-content">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <div className="menu-item-footer">
                    <strong>₹{item.price}</strong>

                    {item.available ? (
                      <button
                        type="button"
                        className="menu-item-add-icon-btn"
                        onClick={(e) => handleAddToCart(e, item)}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </button>
                    ) : (
                      <Badge variant="warning">Unavailable</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;