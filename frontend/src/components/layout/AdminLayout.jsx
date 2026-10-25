
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import cornerBottomLeft from "../../assets/home-corner-bottom-left.png";
import cup from "../../assets/home-cup.png";
import "./AdminLayout.css";

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

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function MenuListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 2v7a3 3 0 0 0 6 0V2" />
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
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 5-7" />
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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="admin-shell">
      <img src={cornerBottomLeft} alt="" className="admin-bg-corner" />
      <img src={cup} alt="" className="admin-bg-cup" />

      {menuOpen && (
        <div className="admin-sidebar-backdrop" onClick={closeMenu} />
      )}

      <header className="admin-header">
        <button
          type="button"
          className="admin-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <img src={logo} alt="Grub Canteen" className="admin-header-logo" />
        <div className="admin-header-spacer" />
        <span className="admin-header-label">Admin Panel</span>
      </header>

      <div className="admin-body">
        <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>

          <h2 className="admin-sidebar-title">Admin Panel</h2>

          <nav className="admin-nav" onClick={closeMenu}>
            <NavLink to="/admin/dashboard">
              <DashboardIcon />
              Dashboard
            </NavLink>
            <NavLink to="/admin/menu">
              <MenuListIcon />
              Menu
            </NavLink>
            <NavLink to="/admin/orders">
              <OrdersIcon />
              Orders
            </NavLink>
            <NavLink to="/admin/inventory">
              <InventoryIcon />
              Inventory
            </NavLink>
            <NavLink to="/admin/analytics">
              <AnalyticsIcon />
              Analytics
            </NavLink>

            <button
              type="button"
              className="admin-nav-button admin-nav-logout"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Logout
            </button>
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
