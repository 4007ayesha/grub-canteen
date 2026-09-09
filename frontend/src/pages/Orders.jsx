import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeedbackForm from "../components/FeedbackForm";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import "./Orders.css";

function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:8000/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();
        // Most recent first — using order id as a stand-in for recency
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setOrders(sorted);
      } catch (error) {
        setError("Unable to load your orders.");
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleFeedbackSubmitted = (orderId) => {
    setSubmittedFeedback((current) => ({
      ...current,
      [orderId]: true,
    }));
  };

  if (!token) {
    return (
      <div className="orders-page">
        <h2>Please login to view your orders.</h2>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <p className="orders-subtitle">Track your orders here.</p>

      {error && <p className="orders-error">{error}</p>}

      {!error && orders.length === 0 && (
        <p className="orders-empty">You haven't placed any orders yet.</p>
      )}

      {orders.map((order) => (
        <Card key={order.id} className="order-card">
          <h2>Order #{order.id}</h2>

          <p>
            <strong>Token:</strong> {order.token_number}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.total_amount}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          <Button onClick={() => navigate(`/order-tracking/${order.id}`)}>
            Track Order
          </Button>

          {order.status === "collected" && (
            <>
              {submittedFeedback[order.id] ? (
                <p className="orders-feedback-thanks">
                  Thank you for your feedback! ❤️
                </p>
              ) : (
                <FeedbackForm
                  orderId={order.id}
                  onSubmitted={() => handleFeedbackSubmitted(order.id)}
                />
              )}
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

export default Orders;