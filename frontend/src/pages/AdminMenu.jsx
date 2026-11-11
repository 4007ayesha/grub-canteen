import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../api";
import AdminPage, { AdminPageHeader } from "../components/layout/AdminPage";
import { Squiggle, LeafIcon } from "../components/layout/Decor";
import logo from "../assets/logo.png";
import "./AdminMenu.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  available: true,
  image_url: "",
  current_stock: "",
};

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...iconProps}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// numbers only: no minus sign, letters or symbols can get in
function sanitizeWholeNumber(value) {
  return value.replace(/[^0-9]/g, "");
}

function sanitizePrice(value) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) return cleaned;

  const whole = cleaned.slice(0, firstDot);
  const decimals = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, 2);

  return `${whole}.${decimals}`;
}

// themed popup (rendered on the page body so it always sits on top)
function AdminModal({ open, onClose, size, label, children }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="amodal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`amodal ${size === "small" ? "amodal-small" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function AdminMenu() {
  const { user, token } = useAuth();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  function loadItems() {
    setLoading(true);
    setError("");
    getMenuItems()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadItems();
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function closeForm() {
    setShowForm(false);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price === undefined || item.price === null ? "" : String(item.price),
      category_id: item.category_id,
      available: item.available,
      image_url: item.image_url || "",
      current_stock:
        item.current_stock === undefined || item.current_stock === null
          ? ""
          : String(item.current_stock),
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const parsedPrice = parseFloat(form.price);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Price must be a number greater than 0.");
      return;
    }

    const parsedStock = parseInt(form.current_stock, 10);

    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError("Current stock must be a number, 0 or greater.");
      return;
    }

    const payload = {
      ...form,
      price: parsedPrice,
      category_id: parseInt(form.category_id, 10),
      current_stock: parsedStock,
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, payload, token);
      } else {
        await createMenuItem(payload, token);
      }
      setShowForm(false);
      loadItems();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function confirmDelete() {
    try {
      await deleteMenuItem(deleteTarget.id, token);
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  }

  if (user?.role !== "admin") {
    return <p>You don't have access to this page.</p>;
  }

  const query = search.trim().toLowerCase();
  const filteredItems = query
    ? items.filter((item) => item.name.toLowerCase().includes(query))
    : items;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Menu Management"
        subtitle="Add, edit or remove menu items."
      />

      <div className="mnu-toolbar">
        <div className="mnu-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search menu items"
          />
          {search && (
            <button
              type="button"
              className="mnu-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <button type="button" className="adm-btn" onClick={openAddForm}>
          + Add Item
        </button>
      </div>

      {!loading && !error && query && items.length > 0 && (
        <p className="mnu-count">
          Showing {filteredItems.length} of {items.length} items
        </p>
      )}

      {loading && <p className="adm-status-text">Loading menu...</p>}
      {!loading && error && <div className="adm-error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="adm-empty">
          <p>No food items found.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
        <div className="adm-empty">
          <p>No menu items match "{search.trim()}".</p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="mnu-list">
          {filteredItems.map((item) => (
            <div key={item.id} className="adm-card mnu-row">
              <span className="mnu-leaf">
                <LeafIcon size={22} />
              </span>

              <div className="mnu-thumb">
                {item.image_url && <img src={item.image_url} alt={item.name} />}
              </div>

              <div className="mnu-info">
                <strong>{item.name}</strong>
                <span>₹{item.price}</span>
              </div>

              <div className="mnu-actions">
                <button
                  type="button"
                  className="adm-btn-soft"
                  onClick={() => openEditForm(item)}
                >
                  <PencilIcon /> Edit
                </button>
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => setDeleteTarget(item)}
                >
                  <TrashIcon /> Delete
                </button>
              </div>

              <span className="mnu-leaf">
                <LeafIcon size={22} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit popup */}
      <AdminModal
        open={showForm}
        onClose={closeForm}
        label={editingId ? "Edit item" : "Add item"}
      >
        <div className="amodal-header">
          <img src={logo} alt="Grub Canteen" className="amodal-logo" />

          <h2 className="amodal-title">
            <Squiggle size={24} />
            {editingId ? "Edit Item" : "Add Item"}
            <Squiggle size={24} flip />
            <LeafIcon size={26} />
          </h2>

          <button
            type="button"
            className="amodal-close"
            onClick={closeForm}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="amodal-preview">
          <div className="amodal-preview-tile">
            {form.image_url.trim() && (
              <img
                key={form.image_url}
                src={form.image_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>

          <div className="amodal-preview-info">
            <strong>{form.name.trim() || "New menu item"}</strong>
            <span>₹{form.price || "0"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="amodal-form">
          <div className="amodal-field amodal-wide">
            <label htmlFor="mnu-name">Name</label>
            <input
              id="mnu-name"
              className="amodal-input"
              type="text"
              placeholder="e.g. Masala Dosa"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="amodal-field amodal-wide">
            <label htmlFor="mnu-desc">Description</label>
            <textarea
              id="mnu-desc"
              className="amodal-textarea"
              placeholder="A short description"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="amodal-field">
            <label htmlFor="mnu-price">Price (₹)</label>
            <input
              id="mnu-price"
              className="amodal-input"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: sanitizePrice(e.target.value) })
              }
              required
            />
          </div>

          <div className="amodal-field">
            <label htmlFor="mnu-stock">Current Stock</label>
            <input
              id="mnu-stock"
              className="amodal-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.current_stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  current_stock: sanitizeWholeNumber(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="amodal-field">
            <label htmlFor="mnu-category">Category</label>
            <select
              id="mnu-category"
              className="amodal-select"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="amodal-field">
            <span className="amodal-fake-label">Availability</span>
            <label className="amodal-switch">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              <span className="amodal-switch-track" />
              {form.available ? "Available" : "Unavailable"}
            </label>
          </div>

          <div className="amodal-field amodal-wide">
            <label htmlFor="mnu-image">Image URL</label>
            <input
              id="mnu-image"
              className="amodal-input"
              type="text"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          {formError && <div className="adm-error amodal-wide">{formError}</div>}

          <div className="amodal-actions amodal-wide">
            <span className="amodal-corner-leaf" aria-hidden="true">
              <LeafIcon size={56} />
            </span>
            <button type="button" className="adm-btn-soft" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="adm-btn">
              {editingId ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation popup */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="small"
        label="Delete item"
      >
        {deleteTarget && (
          <div className="amodal-confirm">
            <span className="amodal-confirm-icon">
              <TrashIcon size={30} />
            </span>

            <h2>Delete this item?</h2>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>
              ? This can't be undone.
            </p>

            <div className="amodal-actions amodal-center">
              <button
                type="button"
                className="adm-btn-soft"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button type="button" className="adm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminPage>
  );
}

export default AdminMenu;