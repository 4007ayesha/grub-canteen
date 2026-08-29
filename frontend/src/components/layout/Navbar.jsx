import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">🍔 Grub Canteen</div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/menu">Menu</Link>
        </li>

        <li>
          <Link to="/orders">Orders</Link>
        </li>

        <li>
          <Link to="/">Cart</Link>
        </li>
      </ul>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {menuOpen && (
        <ul className="navbar-links-mobile">
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>

          <li>
            <Link to="/menu" onClick={() => setMenuOpen(false)}>
              Menu
            </Link>
          </li>

          <li>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>
              Orders
            </Link>
          </li>

          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Cart
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;