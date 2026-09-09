import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useSearch } from "../../context/SearchContext";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import NotificationBell from "../NotificationBell";
import "./StudentLayout.css";

const pageTitles = {
  "/menu": "Menu",
  "/orders": "Orders",
  "/checkout": "Checkout",
  "/order-confirmation": "Order Confirmation",
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/food/")) return "Food Details";
  if (pathname.startsWith("/order-tracking/")) return "Order Tracking";
  return "";
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function StudentLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { setSearchActive } = useSearch();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);
  const hideSearch =
    location.pathname.startsWith("/order-tracking/") ||
    location.pathname === "/orders";

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <h2 className="student-sidebar-title"> Grub Canteen</h2>
        <p className="student-sidebar-subtitle">Student Panel</p>

        <nav className="student-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/orders">Orders</NavLink>

          <button
            type="button"
            className="student-nav-button"
            onClick={() => setCartOpen(true)}
          >
            Cart{totalItems > 0 ? ` (${totalItems})` : ""}
          </button>
        </nav>
      </aside>

      <main className="student-content">
        <div className="student-topbar">
          {pageTitle && <h1 className="student-page-title">{pageTitle}</h1>}

          <div className="student-topbar-spacer" />

          {!hideSearch && (
            <button
              type="button"
              className="student-topbar-icon"
              onClick={() => setSearchActive(true)}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          )}

          <div className="student-bell-circle">
            <NotificationBell />
          </div>
        </div>

        <Outlet />
      </main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay />
    </div>
  );
}

export default StudentLayout;