import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OrderTracking = () => {
  const { orderId } = useParams();
  const { token } = useAuth();

  const [status, setStatus] = useState(null);
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

    const ws = new WebSocket(
      `ws://localhost:8000/orders/ws/${orderId}`
    );

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

  const steps = [
    { value: "received", label: "Received" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "collected", label: "Collected" },
  ];

  const currentIndex = steps.findIndex(
    (step) => step.value === status
  );

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!status) {
    return <h2>Loading order status...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Order Tracking</h1>

      <p>
        <strong>Order ID:</strong> {orderId}
      </p>

      <div style={{ marginTop: "30px" }}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;

          return (
            <div
              key={step.value}
              style={{
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                backgroundColor: isCompleted ? "#d4edda" : "#eee",
                fontWeight: isCompleted ? "bold" : "normal",
              }}
            >
              {isCompleted ? "✓" : "○"} {step.label}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: "20px" }}>
        <strong>Current Status:</strong>{" "}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </p>
    </div>
  );
};

export default OrderTracking;