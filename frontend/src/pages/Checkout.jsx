import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { mockPay } from "../api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import "./Checkout.css";

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
      const result = await mockPay(totalAmount, method, token);

      if (result.status === "success") {
        setStatus("success");
        clearCart();
      } else {
        setStatus("failed");
      }
    } catch (err) {
      setStatus("failed");
      setErrorMessage(err.message);
    }
  }

  if (cart.length === 0 && status !== "success") {
    return (
      <div className="checkout-page">
        <p>Your cart is empty.</p>

        <Button onClick={() => navigate("/menu")}>
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {status !== "success" && (
        <Card className="checkout-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div key={item.id} className="checkout-row">
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <strong>
              Total: ₹{totalAmount.toFixed(2)}
            </strong>
          </div>
        </Card>
      )}

      {status !== "success" && (
        <Card className="checkout-payment">
          <h2>Payment Method</h2>

          <label className="checkout-method">
            <input
              type="radio"
              name="method"
              value="upi"
              checked={method === "upi"}
              onChange={(e) => setMethod(e.target.value)}
              disabled={status === "processing"}
            />
            UPI
          </label>

          <label className="checkout-method">
            <input
              type="radio"
              name="method"
              value="cash"
              checked={method === "cash"}
              onChange={(e) => setMethod(e.target.value)}
              disabled={status === "processing"}
            />
            Cash
          </label>

          <Button
            onClick={handlePayNow}
            disabled={status === "processing"}
          >
            {status === "processing" ? "Processing..." : "Pay Now"}
          </Button>

          {status === "failed" && (
            <p className="checkout-error">
              {errorMessage || "Payment failed. Please try again."}
            </p>
          )}
        </Card>
      )}

      {status === "success" && (
        <Card className="checkout-result">
          <p className="checkout-success">
            Payment Successful ✅
          </p>

          <Button onClick={() => navigate("/menu")}>
            Back to Menu
          </Button>
        </Card>
      )}
    </div>
  );
}

export default Checkout;