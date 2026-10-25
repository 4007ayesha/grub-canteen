
import React from "react";
import "./AdminPage.css";

function AdminPage({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section className={`admin-page ${className}`.trim()}>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && (
            <p className="admin-page-subtitle">{subtitle}</p>
          )}
        </div>
      </header>

      <div className="admin-page-content">
        {children}
      </div>
    </section>
  );
}

export default AdminPage;
