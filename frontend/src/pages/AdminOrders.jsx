import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Phase 10 - Filter
  const [filter, setFilter] = useState("");

  const statuses = [
    "received",
    "preparing",
    "ready",
    "collected",
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = filter ? `?status=${filter}` : "";

      const response = await fetch(
        `http://localhost:8000/orders/admin/all${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, filter]);

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `http://localhost:8000/orders/${orderId}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setMessage(
        `Order #${orderId} status updated to ${newStatus}.`
      );
    } catch (err) {
      setError("Unable to update order status.");
    }
  };

  // Status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case "received":
        return "status-received";

      case "preparing":
        return "status-preparing";

      case "ready":
        return "status-ready";

      case "collected":
        return "status-collected";

      default:
        return "";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-orders-page">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      {/* Header */}
      <div className="admin-orders-header">
        <div>
          <h1>Order Management</h1>
          <p>
            View and manage incoming canteen orders.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-orders-filter">
        <label htmlFor="order-filter">
          Filter Orders:
        </label>

        <select
          id="order-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Orders</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Success message */}
      {message && (
        <div className="admin-orders-message">
          {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="admin-orders-error">
          {error}
        </div>
      )}

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h3>No orders found</h3>

          <p>
            There are no orders matching the selected filter.
          </p>
        </div>
      ) : (
        <div className="admin-orders-grid">

          {orders.map((order) => (
            <div
              key={order.id}
              className="admin-order-card"
            >

              {/* Order heading */}
              <div className="admin-order-card-header">
                <h3>
                  Order #{order.id}
                </h3>

                {/* Status badge */}
                <span
                  className={`admin-order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order details */}
              <div className="admin-order-details">

  <div className="admin-order-detail">
    <span>Token</span>
    <strong>{order.token_number}</strong>
  </div>

  <div className="admin-order-detail">
    <span>Total</span>
    <strong>₹{order.total_amount}</strong>
  </div>

  <div className="admin-order-detail">
    <span>Payment Method</span>
    <strong>
      {order.payment_method
        ? order.payment_method.toUpperCase()
        : "N/A"}
    </strong>
  </div>

  <div className="admin-order-detail">
    <span>Payment Status</span>
    <strong
      className={
        order.payment_status === "paid"
          ? "payment-status-paid"
          : order.payment_status === "pending"
          ? "payment-status-pending"
          : ""
      }
    >
      {order.payment_status
        ? order.payment_status.charAt(0).toUpperCase() +
          order.payment_status.slice(1)
        : "N/A"}
    </strong>
  </div>

</div>

              {/* Update status */}
              <label className="admin-status-label">
                Update Status:

                <select
                  className="admin-status-control"
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(
                      order.id,
                      e.target.value
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default AdminOrders;