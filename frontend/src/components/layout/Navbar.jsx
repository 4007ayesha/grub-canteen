
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CartDrawer from "./CartDrawer";
import NotificationBell from "../NotificationBell";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          🍔 Grub Canteen
        </div>

        <ul className="navbar-links">

          {/* Admin Dashboard */}
          {isAdmin && (
            <li>
              <Link to="/admin/dashboard">
                Dashboard
              </Link>
            </li>
          )}

          {/* Home */}
          {!isAdmin && (
            <li>
              <Link to="/">
                Home
              </Link>
            </li>
          )}

          {/* Menu */}
          <li>
            <Link to={isAdmin ? "/admin/menu" : "/menu"}>
              Menu
            </Link>
          </li>

          {/* Orders */}
          <li>
            <Link to={isAdmin ? "/admin/orders" : "/orders"}>
              Orders
            </Link>
          </li>

          {/* Notifications - Student only */}
          {!isAdmin && (
            <li>
              <NotificationBell />
            </li>
          )}

          {/* Cart - Student only */}
          {!isAdmin && (
            <li>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Cart
              </button>
            </li>
          )}

        </ul>

        {/* Mobile menu button */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {menuOpen && (
          <ul className="navbar-links-mobile">

            {/* Admin Dashboard */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            )}

            {/* Student Home */}
            {!isAdmin && (
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
            )}

            {/* Menu */}
            <li>
              <Link
                to={isAdmin ? "/admin/menu" : "/menu"}
                onClick={() => setMenuOpen(false)}
              >
                Menu
              </Link>
            </li>

            {/* Orders */}
            <li>
              <Link
                to={isAdmin ? "/admin/orders" : "/orders"}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Link>
            </li>

            {/* Notifications - Student only */}
            {!isAdmin && (
              <li>
                <NotificationBell />
              </li>
            )}

            {/* Cart */}
            {!isAdmin && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setCartOpen(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    padding: 0,
                  }}
                >
                  Cart
                </button>
              </li>
            )}

          </ul>
        )}

      </nav>

      {/* Student Cart */}
      {!isAdmin && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
        />
      )}
    </>
  );
}

export default Navbar;

