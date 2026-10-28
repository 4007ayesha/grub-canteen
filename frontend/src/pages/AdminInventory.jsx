import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminPage, { AdminPageHeader } from "../components/layout/AdminPage";
import { Squiggle } from "../components/layout/Decor";
import "./AdminInventory.css";

const AdminInventory = () => {
  const { token } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Stock input values
  const [stockInputs, setStockInputs] = useState({});

  // Waste form
  const [wasteForm, setWasteForm] = useState({
    menu_item_id: "",
    date: new Date().toISOString().split("T")[0],
    prepared_qty: "",
    sold_qty: "",
    wasted_qty: "",
  });

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch inventory");
      }

      const data = await response.json();

      setInventory(data);

      const inputs = {};

      data.forEach((item) => {
        inputs[item.menu_item_id] = {
          current_stock: item.current_stock,
          min_threshold: item.min_threshold,
        };
      });

      setStockInputs(inputs);
    } catch (err) {
      setError("Unable to load inventory.");
    }
  };

  // Fetch waste records
  const fetchWasteRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory/waste", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch waste records");
      }

      const data = await response.json();
      setWasteRecords(data);
    } catch (err) {
      setError("Unable to load waste records.");
    }
  };

  // Load data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([fetchInventory(), fetchWasteRecords()]);

      setLoading(false);
    };

    loadData();
  }, [token]);

  // Handle stock input changes
  const handleStockChange = (menuItemId, field, value) => {
    setStockInputs((current) => ({
      ...current,
      [menuItemId]: {
        ...current[menuItemId],
        [field]: value,
      },
    }));
  };

  // Update inventory
  const updateInventory = async (menuItemId) => {
    try {
      setMessage("");
      setError("");

      const input = stockInputs[menuItemId];

      if (!input) return;

      const currentStock = Number(input.current_stock);
      const minThreshold = Number(input.min_threshold);

      if (currentStock < 0 || minThreshold < 0) {
        setError("Stock and minimum threshold cannot be negative.");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/inventory/${menuItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_stock: currentStock,
            min_threshold: minThreshold,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update inventory");
      }

      setInventory((currentInventory) =>
        currentInventory.map((item) =>
          item.menu_item_id === menuItemId ? data : item
        )
      );

      setMessage(
        `Inventory for menu item #${menuItemId} updated successfully.`
      );
    } catch (err) {
      setError(err.message || "Unable to update inventory.");
    }
  };

  // Handle waste form changes
  const handleWasteChange = (e) => {
    const { name, value } = e.target;

    setWasteForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Submit waste record
  const submitWaste = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const preparedQty = Number(wasteForm.prepared_qty);
      const soldQty = Number(wasteForm.sold_qty);
      const wastedQty = Number(wasteForm.wasted_qty);

      if (preparedQty < 0 || soldQty < 0 || wastedQty < 0) {
        setError("Prepared, sold, and wasted quantities cannot be negative.");
        return;
      }

      if (soldQty + wastedQty > preparedQty) {
        setError("Sold + wasted quantity cannot exceed prepared quantity.");
        return;
      }

      const response = await fetch("http://localhost:8000/inventory/waste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menu_item_id: Number(wasteForm.menu_item_id),
          date: wasteForm.date,
          prepared_qty: preparedQty,
          sold_qty: soldQty,
          wasted_qty: wastedQty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to record waste");
      }

      setWasteRecords((currentRecords) => [data, ...currentRecords]);

      setMessage("Waste record added successfully.");

      setWasteForm({
        menu_item_id: "",
        date: new Date().toISOString().split("T")[0],
        prepared_qty: "",
        sold_qty: "",
        wasted_qty: "",
      });
    } catch (err) {
      setError(err.message || "Unable to record waste.");
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <p className="adm-status-text">Loading inventory...</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Inventory Management"
        subtitle="Monitor stock levels and record daily food waste."
      />

      {message && <div className="adm-message">{message}</div>}
      {error && <div className="adm-error">{error}</div>}

      <div className="inv-grid">
        {/* Current Inventory */}
        <section className="adm-card inv-panel">
          <h2 className="adm-section-title">
            <Squiggle size={24} />
            Current Inventory
          </h2>
          <p className="inv-sub">
            Items at or below their minimum threshold are marked as low stock.
          </p>

          {inventory.length === 0 ? (
            <div className="adm-empty">
              <h3>No inventory records found</h3>
              <p>Add inventory using the backend or update an existing menu item.</p>
            </div>
          ) : (
            <div className="inv-list">
              {inventory.map((item) => {
                const isOutOfStock = item.current_stock === 0;
                const isLowStock = item.current_stock <= item.min_threshold;

                const stockInput = stockInputs[item.menu_item_id] || {
                  current_stock: item.current_stock,
                  min_threshold: item.min_threshold,
                };

                let badgeClass = "inv-badge-ok";
                let badgeText = "In Stock";

                if (isOutOfStock) {
                  badgeClass = "inv-badge-out";
                  badgeText = "Out of Stock";
                } else if (isLowStock) {
                  badgeClass = "inv-badge-low";
                  badgeText = "Low Stock";
                }

                return (
                  <div key={item.id} className="inv-item">
                    <div className="inv-item-head">
                      <h3>Menu Item #{item.menu_item_id}</h3>
                      <span className={`inv-badge ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="inv-kv">
                      <span>Current Stock</span>
                      <strong>{item.current_stock}</strong>
                    </div>

                    <div className="inv-kv">
                      <span>Minimum Threshold</span>
                      <strong>{item.min_threshold}</strong>
                    </div>

                    {isLowStock && (
                      <div className="inv-warning">
                        Stock is at or below the minimum threshold.
                      </div>
                    )}

                    <div className="adm-field">
                      <label>Current Stock</label>
                      <input
                        className="adm-input"
                        type="number"
                        min="0"
                        value={stockInput.current_stock}
                        onChange={(e) =>
                          handleStockChange(
                            item.menu_item_id,
                            "current_stock",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="adm-field">
                      <label>Minimum Threshold</label>
                      <input
                        className="adm-input"
                        type="number"
                        min="0"
                        value={stockInput.min_threshold}
                        onChange={(e) =>
                          handleStockChange(
                            item.menu_item_id,
                            "min_threshold",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="adm-btn"
                      onClick={() => updateInventory(item.menu_item_id)}
                    >
                      Update Stock
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Record Waste */}
        <section className="adm-card inv-panel">
          <h2 className="adm-section-title">
            <Squiggle size={24} />
            Record Daily Waste
          </h2>
          <p className="inv-sub">
            Record how much food was prepared, sold, and wasted.
          </p>

          <form className="inv-waste-form" onSubmit={submitWaste}>
            <div className="adm-field">
              <label htmlFor="menu-item-id">Menu Item ID</label>
              <input
                id="menu-item-id"
                className="adm-input"
                type="number"
                name="menu_item_id"
                min="1"
                placeholder="Enter ID"
                value={wasteForm.menu_item_id}
                onChange={handleWasteChange}
                required
              />
            </div>

            <div className="adm-field">
              <label htmlFor="waste-date">Date</label>
              <input
                id="waste-date"
                className="adm-input"
                type="date"
                name="date"
                value={wasteForm.date}
                onChange={handleWasteChange}
                required
              />
            </div>

            <div className="adm-field">
              <label htmlFor="prepared-qty">Prepared Quantity</label>
              <input
                id="prepared-qty"
                className="adm-input"
                type="number"
                name="prepared_qty"
                min="0"
                placeholder="Enter quantity"
                value={wasteForm.prepared_qty}
                onChange={handleWasteChange}
                required
              />
            </div>

            <div className="adm-field">
              <label htmlFor="sold-qty">Sold Quantity</label>
              <input
                id="sold-qty"
                className="adm-input"
                type="number"
                name="sold_qty"
                min="0"
                placeholder="Enter quantity"
                value={wasteForm.sold_qty}
                onChange={handleWasteChange}
                required
              />
            </div>

            <div className="adm-field">
              <label htmlFor="wasted-qty">Wasted Quantity</label>
              <input
                id="wasted-qty"
                className="adm-input"
                type="number"
                name="wasted_qty"
                min="0"
                placeholder="Enter quantity"
                value={wasteForm.wasted_qty}
                onChange={handleWasteChange}
                required
              />
            </div>

            <button type="submit" className="adm-btn">
              Record Waste
            </button>
          </form>
        </section>
      </div>

      {/* Waste History */}
      <section className="adm-card inv-history">
        <div className="inv-history-head">
          <h2 className="adm-section-title">
            <Squiggle size={24} />
            Waste History
          </h2>
          <p className="inv-sub">
            Historical prepared, sold, and wasted quantities.
          </p>
        </div>

        {wasteRecords.length === 0 ? (
          <div className="adm-empty inv-empty-flat">
            <p>No waste records found.</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Menu Item</th>
                  <th>Date</th>
                  <th>Prepared</th>
                  <th>Sold</th>
                  <th>Wasted</th>
                </tr>
              </thead>

              <tbody>
                {wasteRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>#{record.menu_item_id}</td>
                    <td>{record.date}</td>
                    <td>{record.prepared_qty}</td>
                    <td>{record.sold_qty}</td>
                    <td>{record.wasted_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminPage>
  );
};

export default AdminInventory;