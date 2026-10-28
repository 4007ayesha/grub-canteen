import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import cornerBottomLeft from "../../assets/home-corner-bottom-left.png";
import cup from "../../assets/home-cup.png";
import "./StudentLayout.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

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

function InventoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <img
  src={logo}
  alt="Grub Canteen"
  className="student-sidebar-logo"
/>

          <nav className="student-nav" onClick={closeMenu}>
            <NavLink to="/admin/dashboard">
              <HomeIcon /> Home
            </NavLink>
            <NavLink to="/admin/menu">
              <MenuListIcon /> Menu
            </NavLink>
            <NavLink to="/admin/orders">
              <OrdersIcon /> Orders
            </NavLink>
            <NavLink to="/admin/inventory">
              <InventoryIcon /> Inventory
            </NavLink>
            <NavLink to="/admin/analytics">
              <AnalyticsIcon /> Analytics
            </NavLink>

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;