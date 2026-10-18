import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSearch } from "../../context/SearchContext";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import NotificationBell from "../NotificationBell";
import logo from "../../assets/logo.png";
import cornerBottomLeft from "../../assets/home-corner-bottom-left.png";
import cup from "../../assets/home-cup.png";
import "./StudentLayout.css";

const pageTitles = {
  "/checkout": "Checkout",
};

function getPageTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/food/")) return "Food Details";
  if (pathname.startsWith("/order-tracking/")) return "Order Tracking";
  return "";
}

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function MenuListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 2v7c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2V2" />
      <path d="M6 11v11" />
      <path d="M18 2a4 4 0 0 0-4 4v4h4" />
      <path d="M18 10v12" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 1v4M16 1v4M8 11h8M8 15h5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function StudentLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { setSearchActive } = useSearch();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);
  const hideSearch =
    location.pathname.startsWith("/order-tracking/") ||
    location.pathname === "/orders";

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="student-shell">
      <img src={cornerBottomLeft} alt="" className="student-bg-corner" />
      <img src={cup} alt="" className="student-bg-cup" />

      {menuOpen && (
        <div className="student-sidebar-backdrop" onClick={closeMenu} />
      )}

      <header className="student-header">
        <button
          type="button"
          className="student-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <img src={logo} alt="Grub Canteen" className="student-header-logo" />

        <div className="student-header-spacer" />

        {!hideSearch && (
          <button
            type="button"
            className="student-header-icon"
            onClick={() => setSearchActive(true)}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        )}

        <div className="student-header-icon">
          <NotificationBell />
        </div>
      </header>

      <div className="student-body">
        <aside className={`student-sidebar ${menuOpen ? "open" : ""}`}>
          <button
            type="button"
            className="student-sidebar-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>

          <nav className="student-nav" onClick={closeMenu}>
            <NavLink to="/home">
              <HomeIcon /> Home
            </NavLink>
            <NavLink to="/menu">
              <MenuListIcon /> Menu
            </NavLink>
            <NavLink to="/orders">
              <OrdersIcon /> Orders
            </NavLink>

            <button
              type="button"
              className="student-nav-button"
              onClick={() => setCartOpen(true)}
            >
              <CartIcon /> Cart{totalItems > 0 ? ` (${totalItems})` : ""}
            </button>

            <button
              type="button"
              className="student-nav-button student-nav-logout"
              onClick={handleLogout}
            >
              <LogoutIcon /> Logout
            </button>
          </nav>
        </aside>

        <main className="student-content">
          {pageTitle && <h1 className="student-page-title">{pageTitle}</h1>}
          <Outlet />
        </main>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay />
    </div>
  );
}

export default StudentLayout;