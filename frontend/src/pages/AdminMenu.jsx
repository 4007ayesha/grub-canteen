import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
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

function AdminMenu() {
  const { user, token } = useAuth();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    price: item.price,
    category_id: item.category_id,
    available: item.available,
    image_url: item.image_url || "",
    current_stock: item.current_stock ?? "",
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

  return (
    <div className="admin-menu-page">
      <div className="admin-menu-header">
        <h1>Menu Management</h1>
        <Button onClick={openAddForm}>+ Add Item</Button>
      </div>

      {loading && <p>Loading menu...</p>}
      {!loading && error && <p className="menu-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No food items found.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="admin-menu-list">
          {items.map((item) => (
            <Card key={item.id} className="admin-menu-row">
              <div className="admin-menu-info">
                <strong>{item.name}</strong>
                <span>₹{item.price}</span>
              </div>
              <div className="admin-menu-actions">
                <Button variant="secondary" onClick={() => openEditForm(item)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => setDeleteTarget(item)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2>{editingId ? "Edit Item" : "Add Item"}</h2>
        <form onSubmit={handleSubmit} className="admin-menu-form">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <Input
  label="Price"
  name="price"
  type="number"
  step="0.01"
  min="0.01"
  value={form.price}
  onChange={(e) => setForm({ ...form, price: e.target.value })}
  required
/>

          <label className="admin-menu-label">
            Category
            <select
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
          </label>

          <label className="admin-menu-checkbox">
  <input
    type="checkbox"
    checked={form.available}
    onChange={(e) =>
      setForm({ ...form, available: e.target.checked })
    }
  />
  Available
</label>

<Input
  label="Current Stock"
  name="current_stock"
  type="number"
  min="0"
  value={form.current_stock}
  onChange={(e) =>
    setForm({ ...form, current_stock: e.target.value })
  }
  required
/>

          {formError && <p className="menu-error">{formError}</p>}

          <div className="admin-menu-form-actions">
            <Button type="submit">
              {editingId ? "Save Changes" : "Add Item"}
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <>
            <p>Are you sure you want to delete "{deleteTarget.name}"?</p>
            <div className="admin-menu-form-actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button onClick={confirmDelete}>Delete</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default AdminMenu;