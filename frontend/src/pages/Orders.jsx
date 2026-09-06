
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeedbackForm from "../components/FeedbackForm";

function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/orders/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();
        setOrders(data);
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
      <div style={{ padding: "30px" }}>
        <h2>Please login to view your orders.</h2>

        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Orders</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!error && orders.length === 0 && (
        <p>You haven't placed any orders yet.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <h2>Order #{order.id}</h2>

          <p>
            <strong>Token:</strong> {order.token_number}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.total_amount}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {order.status}
          </p>

          <button
            onClick={() =>
              navigate(`/order-tracking/${order.id}`)
            }
          >
            Track Order
          </button>

          {order.status === "collected" && (
            <>
              {submittedFeedback[order.id] ? (
                <p
                  style={{
                    marginTop: "15px",
                    fontWeight: "bold",
                  }}
                >
                  Thank you for your feedback! ❤️
                </p>
              ) : (
                <FeedbackForm
                  orderId={order.id}
                  onSubmitted={() =>
                    handleFeedbackSubmitted(order.id)
                  }
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;

