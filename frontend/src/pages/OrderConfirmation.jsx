import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import PageDecor from "../components/layout/PageDecor";
import { LeafIcon } from "../components/layout/Decor";
import "./OrderConfirmation.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ConfirmIcon() {
  return (
    <svg
      width="160"
      height="116"
      viewBox="0 0 160 116"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#E96F91" strokeWidth="3" strokeLinecap="round">
        <line x1="14" y1="30" x2="26" y2="36" />
        <line x1="8" y1="50" x2="22" y2="52" />
        <line x1="146" y1="30" x2="134" y2="36" />
        <line x1="152" y1="50" x2="138" y2="52" />
      </g>

      <g transform="translate(32 0)">
        <rect
          x="14"
          y="16"
          width="68"
          height="92"
          rx="10"
          fill="#FFF9F5"
          stroke="#E96F91"
          strokeWidth="5"
        />
        <rect
          x="32"
          y="6"
          width="32"
          height="20"
          rx="7"
          fill="#FFF9F5"
          stroke="#E96F91"
          strokeWidth="5"
        />
        <circle cx="48" cy="56" r="20" fill="#E96F91" />
        <polyline
          points="38,56 45,64 59,48"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="34"
          y1="90"
          x2="62"
          y2="90"
          stroke="#F7C5D2"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 1v4M16 1v4M8 11h8M8 15h5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
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

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/menu" replace />;
  }

  const isCash = order.payment_method === "cash";

  return (
    <div className="oc-page">
      <PageDecor />

      <div className="oc-card">
        <div className="oc-icon-row">
          <span className="oc-leaf oc-leaf-left">
            <LeafIcon size={58} />
          </span>
          <ConfirmIcon />
          <span className="oc-leaf oc-leaf-right">
            <LeafIcon size={58} />
          </span>
        </div>

        <h1>Order Confirmed!</h1>
        <p className="oc-lead">Your order has been placed successfully.</p>
        <p className="oc-sub">We're preparing your delicious meal!</p>

        <div className="oc-summary">
          <div className="oc-token">
            <span>Your Token</span>
            <strong>{order.token_number}</strong>
          </div>

          <div className="oc-divider" />

          <div className="oc-meta">
            <p className="oc-total">
              Total: <strong>₹{order.total_amount}</strong>
            </p>
            <p>Payment: {isCash ? "Cash" : "UPI"}</p>
            <p className={isCash ? "oc-status-pending" : "oc-status-paid"}>
              Status: {isCash ? "Pending — pay at the counter" : "Paid"}
            </p>
          </div>
        </div>

        <div className="oc-actions">
          <Link
            to={`/order-tracking/${order.id}`}
            className="oc-btn oc-btn-primary"
          >
            <ClipboardIcon />
            View Order Details
            <ArrowIcon />
          </Link>

          <Link to="/home" className="oc-btn oc-btn-soft">
            <HomeIcon />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;