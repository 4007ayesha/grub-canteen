import React, { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">🍔 Grub Canteen</div>

      {/* Links for desktop */}
      <ul className="navbar-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Menu</a></li>
        <li><a href="#">Orders</a></li>
        <li><a href="#">Cart</a></li>
      </ul>

      {/* Hamburger icon for mobile */}
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Dropdown links for mobile, shown only when menuOpen is true */}
      {menuOpen && (
        <ul className="navbar-links-mobile">
          <li><a href="#">Home</a></li>
          <li><a href="#">Menu</a></li>
          <li><a href="#">Orders</a></li>
          <li><a href="#">Cart</a></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;