import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/orders/admin/all",
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
        setError("Unable to load orders.");
      }
    };

    if (user?.role === "admin" && token) {
      fetchOrders();
    }
  }, [user, token]);

  if (user?.role !== "admin") {
    return <h2>Access denied. Admins only.</h2>;
  }

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

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome to the Grub Canteen Admin Panel.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="admin-dashboard-actions">

        <Button onClick={() => navigate("/admin/menu")}>
          Manage Menu
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate("/admin/orders")}
        >
          Manage Orders
        </Button>

      </div>

      {/* Recent Orders */}
      <section className="recent-orders-section">

        <div className="section-heading">
          <h2>Recent Orders</h2>

          <Button
            variant="secondary"
            onClick={() => navigate("/admin/orders")}
          >
            View All Orders
          </Button>
        </div>

        {error && (
          <p className="admin-error">
            {error}
          </p>
        )}

        {orders.length === 0 && !error ? (
          <div className="empty-orders">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-grid">

            {orders.map((order) => (
              <div
                key={order.id}
                className="admin-order-card"
                onClick={() => navigate("/admin/orders")}
              >

                <div className="order-card-header">

                  <h3>
                    Order #{order.id}
                  </h3>

                  <span
                    className={`order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                </div>

                <div className="order-card-details">

                  <div>
                    <span>Token</span>
                    <strong>{order.token_number}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>₹{order.total_amount}</strong>
                  </div>

                </div>

                <p className="manage-order-text">
                  Click to manage order →
                </p>

              </div>
            ))}

          </div>
        )}

      </section>

    

    </div>
  );
}

export default AdminDashboard;