import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import logo from "../../assets/logo.png";
import "./CartDrawer.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function formatPrice(value) {
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function Squiggle({ flip }) {
  return (
    <svg
      className="cart-squiggle"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
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

function LeafIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M6 26C6 14 14 6 26 5C27 17 20 25 8 26Z"
        fill="#91A98C"
        fillOpacity="0.35"
        stroke="#91A98C"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 26C12 19 17 14 24 8"
        stroke="#91A98C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 1v4M16 1v4M8 11h8M8 15h5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCheckout() {
    onClose();
    navigate("/checkout");
  }

  return (
    <div
      className="cart-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cart-modal" role="dialog" aria-modal="true" aria-label="My Cart">
        <div className="cart-header">
          <img src={logo} alt="Grub Canteen" className="cart-logo" />

          <h2 className="cart-title">
            <Squiggle />
            My Cart
            <Squiggle flip />
            <LeafIcon />
          </h2>

          <button
            type="button"
            className="cart-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="cart-list">
          {cart.length === 0 && <p className="cart-empty">Your cart is empty</p>}

          {cart.map((item) => {
            const unitPrice = Number(item.price);
            const hasStockLimit =
              item.current_stock !== undefined && item.current_stock !== null;
            const atMax = hasStockLimit && item.quantity >= item.current_stock;

            return (
              <div key={item.id} className="cart-row">
                <div className="cart-row-image">
                  {item.image_url && <img src={item.image_url} alt={item.name} />}
                </div>

                <div className="cart-row-info">
                  <p className="cart-row-name">{item.name}</p>
                  {item.description && (
                    <p className="cart-row-desc">{item.description}</p>
                  )}
                  <p className="cart-row-price">₹{formatPrice(unitPrice)}</p>
                </div>

                <div className="cart-row-qty">
                  <button
                    type="button"
                    className="cart-qty-btn cart-qty-minus"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease ${item.name}`}
                  >
                    −
                  </button>
                  <span className="cart-qty-number">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart-qty-btn cart-qty-plus"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={atMax}
                    title={atMax ? `Only ${item.current_stock} in stock` : undefined}
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <span className="cart-row-line">
                  ₹{formatPrice(unitPrice * item.quantity)}
                </span>

                <button
                  type="button"
                  className="cart-row-remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">
              <ClipboardIcon />
              Total Amount
            </span>
            <strong className="cart-total-value">₹{formatPrice(totalAmount)}</strong>
          </div>

          <div className="cart-checkout-wrap">
            <div className="cart-corner-leaf" aria-hidden="true">
              <LeafIcon size={64} />
            </div>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              <CardIcon />
              Proceed to Checkout
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;