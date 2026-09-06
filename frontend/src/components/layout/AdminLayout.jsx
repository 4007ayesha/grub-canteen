
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Grub Canteen</h2>
        <p className="admin-sidebar-subtitle">Admin Panel</p>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/menu">Menu</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/inventory">Inventory</NavLink>
          <NavLink to="/admin/analytics">Analytics</NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
