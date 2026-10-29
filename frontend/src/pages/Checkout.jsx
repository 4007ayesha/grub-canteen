import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { mockPay, createOrder } from "../api";
import Button from "../components/ui/Button";
import PageDecor from "../components/layout/PageDecor";
import { Squiggle } from "../components/layout/Decor";
import "./Checkout.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...iconProps}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="6" y1="12" x2="6.01" y2="12" />
      <line x1="18" y1="12" x2="18.01" y2="12" />
    </svg>
  );
}

function Checkout() {
  const { cart, totalAmount, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("upi");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePayNow() {
    setStatus("processing");
    setErrorMessage("");

    try {
      const paymentResult = await mockPay(totalAmount, method, token);

      if (paymentResult.status !== "success") {
        setStatus("failed");
        setErrorMessage("Payment failed. Please try again.");
        return;
      }

      const orderData = {
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price_at_order: Number(item.price),
        })),
        total_amount: Number(totalAmount),
        payment_id: paymentResult.id,
      };

      const order = await createOrder(orderData, token);

      clearCart();

      navigate("/order-confirmation", {
        state: {
          order: {
            ...order,
            payment_method: method,
          },
        },
      });
    } catch (err) {
      setStatus("failed");
      setErrorMessage(err.message);
    }
  }

  const processing = status === "processing";

  if (cart.length === 0 && status !== "success") {
    return (
      <div className="ck-page">
        <PageDecor />

        <div className="ck-card ck-empty">
          <p>Your cart is empty.</p>
          <Button onClick={() => navigate("/menu")}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-page">
      <PageDecor />

      <div className="ck-grid">
        <section className="ck-card">
          <h2 className="ck-title">
            <Squiggle size={26} />
            Order Summary
          </h2>

          <div className="ck-items">
            {cart.map((item) => (
              <div key={item.id} className="ck-row">
                <div className="ck-thumb">
                  {item.image_url && <img src={item.image_url} alt={item.name} />}
                </div>

                <span className="ck-row-name">
                  {item.name} <small>× {item.quantity}</small>
                </span>

                <span className="ck-row-price">
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="ck-total">
            <span>Total</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>
        </section>

        <section className="ck-card">
          <h2 className="ck-title">
            <Squiggle size={26} />
            Payment Method
          </h2>

          <div className="ck-methods">
            <label
              className={`ck-method ${method === "upi" ? "active" : ""} ${
                processing ? "disabled" : ""
              }`}
            >
              <input
                type="radio"
                name="method"
                value="upi"
                checked={method === "upi"}
                onChange={(e) => setMethod(e.target.value)}
                disabled={processing}
              />
              <span className="ck-method-icon">
                <PhoneIcon />
              </span>
              <span className="ck-method-text">
                <strong>UPI</strong>
                <small>Pay instantly with UPI</small>
              </span>
            </label>

            <label
              className={`ck-method ${method === "cash" ? "active" : ""} ${
                processing ? "disabled" : ""
              }`}
            >
              <input
                type="radio"
                name="method"
                value="cash"
                checked={method === "cash"}
                onChange={(e) => setMethod(e.target.value)}
                disabled={processing}
              />
              <span className="ck-method-icon">
                <CashIcon />
              </span>
              <span className="ck-method-text">
                <strong>Cash</strong>
                <small>Pay at the counter</small>
              </span>
            </label>
          </div>

          <button
            type="button"
            className="ck-pay"
            onClick={handlePayNow}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : method === "cash"
                ? "Confirm Order"
                : "Pay Now"}
          </button>

          {status === "failed" && (
            <p className="ck-error">
              {errorMessage || "Payment failed. Please try again."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Checkout;