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

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function StudentLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { setSearchActive } = useSearch();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);
  const hideSearch =
    location.pathname.startsWith("/order-tracking/") ||
    location.pathname === "/orders";

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="student-layout">
      <button
        type="button"
        className="student-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {menuOpen && (
        <div className="student-sidebar-backdrop" onClick={closeMenu} />
      )}

      <aside className={`student-sidebar ${menuOpen ? "open" : ""}`}>
        <h2 className="student-sidebar-title">Grub Canteen</h2>
        <p className="student-sidebar-subtitle">Student Panel</p>

        <nav className="student-nav" onClick={closeMenu}>
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