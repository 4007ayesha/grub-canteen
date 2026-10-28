import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminPage, { AdminPageHeader } from "../components/layout/AdminPage";
import { Squiggle, LeafIcon } from "../components/layout/Decor";
import "./AdminOrders.css";

const statuses = ["received", "preparing", "ready", "collected"];

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const AdminOrders = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

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
        let detail = "";
        try {
          const data = await response.json();
          detail = typeof data.detail === "string" ? data.detail : "";
        } catch {
          detail = "";
        }
        throw new Error(detail || "Unable to update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setMessage(`Order #${orderId} status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <p className="adm-status-text">Loading orders...</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Order Management"
        subtitle="View and manage incoming canteen orders."
      />

      <div className="adm-card ord-filter">
        <label htmlFor="order-filter">Filter Orders:</label>

        <select
          id="order-filter"
          className="adm-select ord-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </div>

      {message && <div className="adm-message">{message}</div>}
      {error && <div className="adm-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="adm-empty">
          <h3>No orders found</h3>
          <p>There are no orders matching the selected filter.</p>
        </div>
      ) : (
        <div className="ord-grid">
          {orders.map((order) => {
            const currentIndex = statuses.indexOf(order.status);

            return (
              <div key={order.id} className="adm-card ord-card">
                <div className="ord-head">
                  <h3>
                    <Squiggle size={20} />
                    Order #{order.id}
                  </h3>
                  <span className={`adm-pill adm-status-${order.status}`}>
                    {capitalize(order.status)}
                  </span>
                </div>

                <div className="ord-kv">
                  <span>Token</span>
                  <strong>{order.token_number}</strong>
                </div>

                <div className="ord-kv">
                  <span>Total</span>
                  <strong>₹{order.total_amount}</strong>
                </div>

                <div className="ord-kv">
                  <span>Payment Method</span>
                  <strong>
                    {order.payment_method
                      ? order.payment_method.toUpperCase()
                      : "N/A"}
                  </strong>
                </div>

                <div className="ord-kv">
                  <span>Payment Status</span>
                  <strong
                    className={
                      order.payment_status === "paid"
                        ? "ord-pay-paid"
                        : order.payment_status === "pending"
                        ? "ord-pay-pending"
                        : ""
                    }
                  >
                    {order.payment_status
                      ? capitalize(order.payment_status)
                      : "N/A"}
                  </strong>
                </div>

                <label className="ord-select-label">
                  Update Status:
                  <select
                    className="adm-select ord-select"
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    {statuses.map((status, index) => (
                      <option
                        key={status}
                        value={status}
                        disabled={
                          currentIndex !== -1 &&
                          (index < currentIndex || index > currentIndex + 1)
                        }
                      >
                        {capitalize(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <span className="ord-leaf">
                  <LeafIcon size={22} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
};

export default AdminOrders;