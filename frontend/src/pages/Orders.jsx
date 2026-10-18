import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeedbackForm from "../components/FeedbackForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import PageDecor from "../components/layout/PageDecor";
import "./Orders.css";

function formatOrderNo(id) {
  return `#ORD${String(id).padStart(5, "0")}`;
}

function formatPrice(value) {
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function statusLabel(status) {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function Squiggle() {
  return (
    <svg
      className="orders-squiggle"
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

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function OrdersTable({ orders, submittedFeedback, onTrack, onRate }) {
  return (
    <div className="orders-card">
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Token No.</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Track Order</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{formatOrderNo(order.id)}</td>
                <td>{order.token_number}</td>
                <td>₹{formatPrice(order.total_amount)}</td>
                <td>
                  <span
                    className={`orders-status orders-status-${order.status}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td>
                  <div className="orders-actions">
                    <button
                      type="button"
                      className="orders-track-btn"
                      onClick={() => onTrack(order.id)}
                    >
                      <PinIcon />
                      Track Order
                    </button>

                    {order.status === "collected" &&
                      (submittedFeedback[order.id] ? (
                        <span className="orders-thanks">Thanks ♥</span>
                      ) : (
                        <button
                          type="button"
                          className="orders-rate-btn"
                          onClick={() => onRate(order.id)}
                        >
                          Rate
                        </button>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [feedbackOrderId, setFeedbackOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

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
      } catch (err) {
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
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
    setFeedbackOrderId(null);
  };

  if (!token) {
    return (
      <div className="orders-page">
        <h2>Please login to view your orders.</h2>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 4);
  const previousOrders = orders.slice(4);

  return (
    <div className="orders-page">
      <PageDecor />

      {loading && <p className="orders-status-text">Loading your orders...</p>}
      {!loading && error && <p className="orders-error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="orders-status-text">You haven't placed any orders yet.</p>
      )}

      {!loading && !error && recentOrders.length > 0 && (
        <section className="orders-section">
          <h2 className="orders-heading">
            <Squiggle />
            Recent Orders
          </h2>

          <OrdersTable
            orders={recentOrders}
            submittedFeedback={submittedFeedback}
            onTrack={(id) => navigate(`/order-tracking/${id}`)}
            onRate={setFeedbackOrderId}
          />
        </section>
      )}

      {!loading && !error && previousOrders.length > 0 && (
        <section className="orders-section">
          <h2 className="orders-heading">
            <Squiggle />
            Previous Orders
          </h2>

          <OrdersTable
            orders={previousOrders}
            submittedFeedback={submittedFeedback}
            onTrack={(id) => navigate(`/order-tracking/${id}`)}
            onRate={setFeedbackOrderId}
          />
        </section>
      )}

      <Modal
        isOpen={feedbackOrderId !== null}
        onClose={() => setFeedbackOrderId(null)}
      >
        {feedbackOrderId !== null && (
          <FeedbackForm
            orderId={feedbackOrderId}
            onSubmitted={() => handleFeedbackSubmitted(feedbackOrderId)}
          />
        )}
      </Modal>
    </div>
  );
}

export default Orders;