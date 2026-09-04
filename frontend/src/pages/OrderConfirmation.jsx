import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/menu" replace />;
  }

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
          <h2>{order.token_number}</h2>
        </div>

        <div className="order-details">
          <p>
            <strong>Total:</strong> ₹{order.total_amount}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            {order.payment_method === "cash" ? "Cash" : "UPI"}
          </p>

          {order.payment_method === "cash" && (
            <p>
              <strong>Payment Status:</strong> Pending — Pay at the counter
            </p>
          )}
        </div>

        <Link to="/menu" className="back-to-menu">
          Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
