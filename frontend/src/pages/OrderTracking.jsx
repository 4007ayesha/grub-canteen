import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageDecor from "../components/layout/PageDecor";
import "./OrderTracking.css";

const steps = [
  { value: "received", label: "Received", hint: "We've got your order" },
  { value: "preparing", label: "Preparing", hint: "Your meal is being made" },
  { value: "ready", label: "Ready", hint: "Pick it up at the counter" },
  { value: "collected", label: "Collected", hint: "Enjoy your meal!" },
];

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatOrderNo(id) {
  return `#ORD${String(id).padStart(5, "0")}`;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const { token } = useAuth();

  const [status, setStatus] = useState(null);
  const [tokenNumber, setTokenNumber] = useState("");
  const [error, setError] = useState("");

  // 1. Get the latest status from the database
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch order");
        }

        const order = await response.json();
        setStatus(order.status);
        setTokenNumber(order.token_number || "");
      } catch (err) {
        setError("Unable to load order status.");
      }
    };

    if (token) {
      fetchOrder();
    }
  }, [orderId, token]);

  // 2. Connect to WebSocket for live updates
  useEffect(() => {
    if (!orderId) return;

    const ws = new WebSocket(`ws://localhost:8000/orders/ws/${orderId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("New order status:", data.status);

      setStatus(data.status);
    };

    ws.onerror = () => {
      console.log("WebSocket error");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [orderId]);

  const currentIndex = steps.findIndex((step) => step.value === status);

  return (
    <div className="trk-page">
      <PageDecor />

      <Link to="/orders" className="trk-back">
        <ArrowLeftIcon />
        Back to Orders
      </Link>

      {error && <p className="trk-error">{error}</p>}

      {!error && !status && (
        <p className="trk-status-text">Loading order status...</p>
      )}

      {!error && status && (
        <div className="trk-card">
          <div className="trk-head">
            <h2>Order {formatOrderNo(orderId)}</h2>
            {tokenNumber && (
              <span className="trk-token">Token {tokenNumber}</span>
            )}
          </div>

          <ol className="trk-steps">
            {steps.map((step, index) => {
              const done = index <= currentIndex;
              const current = index === currentIndex;

              return (
                <li
                  key={step.value}
                  className={`trk-step ${done ? "done" : ""} ${
                    current ? "current" : ""
                  }`}
                >
                  <span className="trk-dot">
                    {done ? <CheckIcon /> : index + 1}
                  </span>

                  <span className="trk-step-text">
                    <strong>{step.label}</strong>
                    <small>{step.hint}</small>
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="trk-current">
            Current Status:{" "}
            <strong>{status.charAt(0).toUpperCase() + status.slice(1)}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;