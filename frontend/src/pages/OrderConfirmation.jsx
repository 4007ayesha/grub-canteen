import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-card">
        <div className="success-icon">🎉</div>

        <h1>Order Confirmed!</h1>

        <p className="success-message">
          Your order has been placed successfully.
        </p>

        <div className="order-token">
          <p>Your Token</p>
          <h2>{order?.token_number || "T4821"}</h2>
        </div>

        <div className="order-details">
          <p>
            <strong>Total:</strong> ₹{order?.total_amount || 240}
          </p>

          <p>
            <strong>Payment:</strong> {order?.payment_method || "Cash"}
          </p>
        </div>

        <Link to="/menu" className="back-to-menu">
          Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;