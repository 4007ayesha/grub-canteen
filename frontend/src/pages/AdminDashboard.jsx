import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMenuItems } from "../api";
import AdminPage from "../components/layout/AdminPage";
import { Squiggle } from "../components/layout/Decor";
import heroLeft from "../assets/home-hero-left.png";
import heroRight from "../assets/home-hero-right.png";
import "./AdminDashboard.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ClocheIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 17a9 9 0 0 1 18 0" />
      <line x1="2" y1="17" x2="22" y2="17" />
      <line x1="12" y1="8" x2="12" y2="6" />
      <line x1="10" y1="6" x2="14" y2="6" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 1v4M16 1v4M8 11h8M8 15h5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function statusLabel(status) {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function summarizeItems(order, names) {
  const items = order.items || [];
  if (items.length === 0) return "";

  const parts = items.slice(0, 2).map((item) => {
    const name = names[item.menu_item_id] || `Item #${item.menu_item_id}`;
    return item.quantity > 1 ? `${name} ×${item.quantity}` : name;
  });

  const more = items.length - 2;
  return parts.join(", ") + (more > 0 ? ` + ${more} more` : "");
}

function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [itemNames, setItemNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:8000/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError("Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && token) {
      fetchOrders();
    }
  }, [user, token]);

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        const map = {};
        items.forEach((item) => {
          map[item.id] = item.name;
        });
        setItemNames(map);
      })
      .catch(() => setItemNames({}));
  }, []);

  if (user?.role !== "admin") {
    return <h2>Access denied. Admins only.</h2>;
  }

  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 4);

  return (
    <AdminPage lamp={false}>
      <section className="dash-hero">
        <img
          src={heroLeft}
          alt=""
          className="dash-hero-art dash-hero-art-left"
        />

        <div className="dash-hero-center">
          <div className="dash-hero-heading">
            <Squiggle size={40} />
            <h1>Welcome back admin</h1>
            <Squiggle size={40} flip />
          </div>

          <p className="dash-hero-tagline">
            Good Food <span className="dash-heart">♥</span> Better Mood
          </p>

          <div className="dash-hero-smile" />
        </div>

        <img
          src={heroRight}
          alt=""
          className="dash-hero-art dash-hero-art-right"
        />

        <span className="dash-hero-motto" aria-hidden="true">
          Fresh
          <br />
          Tasty
          <br />
          Always
        </span>
      </section>

      <div className="dash-actions">
        <button
          type="button"
          className="dash-action dash-action-menu"
          onClick={() => navigate("/admin/menu")}
        >
          <span className="dash-action-icon">
            <ClocheIcon />
          </span>
          <span className="dash-action-text">
            <strong>Manage Menu</strong>
            <small>Add, edit or remove menu items</small>
          </span>
          <span className="dash-action-arrow">
            <ArrowIcon />
          </span>
        </button>

        <button
          type="button"
          className="dash-action dash-action-orders"
          onClick={() => navigate("/admin/orders")}
        >
          <span className="dash-action-icon">
            <ClipboardIcon />
          </span>
          <span className="dash-action-text">
            <strong>Manage Orders</strong>
            <small>View and update order status</small>
          </span>
          <span className="dash-action-arrow">
            <ArrowIcon />
          </span>
        </button>
      </div>

      <section>
        <div className="dash-recent-head">
          <h2 className="adm-section-title">
            <Squiggle size={28} />
            Recent Orders
          </h2>

          <button
            type="button"
            className="adm-btn"
            onClick={() => navigate("/admin/orders")}
          >
            View All Orders
          </button>
        </div>

        {loading && <p className="adm-status-text">Loading orders...</p>}
        {!loading && error && <div className="adm-error">{error}</div>}

        {!loading && !error && recentOrders.length === 0 && (
          <div className="adm-empty">
            <p>No orders found.</p>
          </div>
        )}

        {!loading && !error && recentOrders.length > 0 && (
          <div className="dash-recent-grid">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="adm-card dash-recent-card"
                onClick={() => navigate("/admin/orders")}
              >
                <div className="dash-card-top">
                  <h3>Order #{order.id}</h3>
                  <span className="dash-token">Token {order.token_number}</span>
                </div>

                <p className="dash-card-items">
                  {summarizeItems(order, itemNames)}
                </p>

                <p className="dash-card-total">
                  Total: ₹{order.total_amount}
                </p>

                <span
                  className={`adm-pill adm-pill-dot adm-status-${order.status}`}
                >
                  {statusLabel(order.status)}
                </span>

                <button type="button" className="adm-btn-soft dash-manage">
                  Click to manage order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminPage>
  );
}

export default AdminDashboard;