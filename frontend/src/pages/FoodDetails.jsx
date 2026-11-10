import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMenuItem } from "../api";
import { useCart } from "../context/CartContext";
import { playAddSound, playRemoveSound } from "../utils/sound";
import "./FoodDetails.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps} strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps} strokeWidth="3">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function FoodDetails() {
  const { id } = useParams();
  const { cart, addToCart, updateQuantity } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getMenuItem(id)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load this item.");
        setLoading(false);
      });
  }, [id]);

  const cartEntry = item ? cart.find((c) => c.id === item.id) : null;
  const quantity = cartEntry ? cartEntry.quantity : 0;

  const hasLimit =
    item && item.current_stock !== undefined && item.current_stock !== null;
  const outOfStock = item && (!item.available || item.current_stock === 0);
  const atMax = Boolean(hasLimit && quantity >= item.current_stock);
  const lowStock = Boolean(
    hasLimit && item.current_stock > 0 && item.current_stock <= 5
  );

  function handleAdd() {
    addToCart(item);
    playAddSound();
  }

  function handleChange(newQuantity) {
    if (newQuantity > quantity && hasLimit && newQuantity > item.current_stock) {
      return;
    }

    updateQuantity(item.id, newQuantity);

    if (newQuantity > quantity) {
      playAddSound();
    } else {
      playRemoveSound();
    }
  }

  return (
    <div className="fd-page">
      <Link to="/menu" className="fd-back">
        <ArrowLeftIcon />
        Back to Menu
      </Link>

      {loading && <p className="fd-status">Loading...</p>}
      {!loading && error && <p className="fd-error">{error}</p>}

      {!loading && !error && item && (
        <div className="fd-card">
          <div className="fd-image">
            {item.image_url && <img src={item.image_url} alt={item.name} />}
          </div>

          <div className="fd-info">
            <h2>{item.name}</h2>

            {item.description && <p className="fd-desc">{item.description}</p>}

            <p className="fd-price">₹{item.price}</p>

            {lowStock && !outOfStock && (
              <p className="fd-low-stock">Only {item.current_stock} left</p>
            )}

            {outOfStock ? (
              <p className="fd-unavailable">Currently out of stock</p>
            ) : quantity === 0 ? (
              <button type="button" className="fd-add" onClick={handleAdd}>
                <CartIcon />
                Add to Cart
              </button>
            ) : (
              <div className="fd-in-cart">
                <div className="fd-stepper">
                  <button
                    type="button"
                    className="fd-step-btn"
                    onClick={() => handleChange(quantity - 1)}
                    aria-label="Remove one"
                  >
                    <MinusIcon />
                  </button>

                  <span className="fd-step-qty">{quantity}</span>

                  <button
                    type="button"
                    className="fd-step-btn"
                    onClick={() => handleChange(quantity + 1)}
                    disabled={atMax}
                    aria-label="Add one more"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <p className="fd-in-cart-text">
                  <strong>{quantity}</strong> in your cart
                  {atMax && <span> (maximum available)</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodDetails;