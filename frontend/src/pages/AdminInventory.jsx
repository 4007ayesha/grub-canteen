
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
      const response = await fetch(
        "http://localhost:8000/inventory/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch inventory");
      }

      const data = await response.json();

      setInventory(data);

      // Set input values for each inventory item
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
      const response = await fetch(
        "http://localhost:8000/inventory/waste",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      await Promise.all([
        fetchInventory(),
        fetchWasteRecords(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [token]);

  // Handle stock input changes
  const handleStockChange = (
    menuItemId,
    field,
    value
  ) => {
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
        setError(
          "Stock and minimum threshold cannot be negative."
        );
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
        throw new Error(
          data.detail || "Unable to update inventory"
        );
      }

      setInventory((currentInventory) =>
        currentInventory.map((item) =>
          item.menu_item_id === menuItemId
            ? data
            : item
        )
      );

      setMessage(
        `Inventory for menu item #${menuItemId} updated successfully.`
      );
    } catch (err) {
      setError(
        err.message || "Unable to update inventory."
      );
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

      const preparedQty = Number(
        wasteForm.prepared_qty
      );
      const soldQty = Number(wasteForm.sold_qty);
      const wastedQty = Number(wasteForm.wasted_qty);

      if (
        preparedQty < 0 ||
        soldQty < 0 ||
        wastedQty < 0
      ) {
        setError(
          "Prepared, sold, and wasted quantities cannot be negative."
        );
        return;
      }

      if (soldQty + wastedQty > preparedQty) {
        setError(
          "Sold + wasted quantity cannot exceed prepared quantity."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:8000/inventory/waste",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menu_item_id: Number(
              wasteForm.menu_item_id
            ),
            date: wasteForm.date,
            prepared_qty: preparedQty,
            sold_qty: soldQty,
            wasted_qty: wastedQty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to record waste"
        );
      }

      setWasteRecords((currentRecords) => [
        data,
        ...currentRecords,
      ]);

      setMessage(
        "Waste record added successfully."
      );

      setWasteForm({
        menu_item_id: "",
        date: new Date().toISOString().split("T")[0],
        prepared_qty: "",
        sold_qty: "",
        wasted_qty: "",
      });
    } catch (err) {
      setError(
        err.message || "Unable to record waste."
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-inventory-page">
        <h2>Loading inventory...</h2>
      </div>
    );
  }

  return (
    <div className="admin-inventory-page">

      {/* Header */}
      <div className="admin-inventory-header">
        <h1>Inventory Management</h1>

        <p>
          Monitor stock levels and record daily food
          waste.
        </p>
      </div>

      {/* Success message */}
      {message && (
        <div className="admin-inventory-message">
          {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="admin-inventory-error">
          {error}
        </div>
      )}

      {/* Current Inventory */}
      <section className="admin-inventory-section">

        <div className="admin-inventory-section-header">
          <h2>Current Inventory</h2>

          <p>
            Items at or below their minimum threshold are
            marked as low stock.
          </p>
        </div>

        {inventory.length === 0 ? (
          <div className="admin-inventory-empty">
            <h3>No inventory records found</h3>

            <p>
              Add inventory using the backend or update
              an existing menu item.
            </p>
          </div>
        ) : (
          <div className="admin-inventory-grid">

            {inventory.map((item) => {
              const isOutOfStock =
                item.current_stock === 0;

              const isLowStock =
                item.current_stock <=
                item.min_threshold;

              const stockInput =
                stockInputs[item.menu_item_id] || {
                  current_stock: item.current_stock,
                  min_threshold: item.min_threshold,
                };

              let stockClass =
                "inventory-stock-normal";

              let stockText = "In Stock";

              if (isOutOfStock) {
                stockClass =
                  "inventory-stock-out";
                stockText = "Out of Stock";
              } else if (isLowStock) {
                stockClass =
                  "inventory-stock-low";
                stockText = "Low Stock";
              }

              return (
                <div
                  key={item.id}
                  className="admin-inventory-card"
                >

                  {/* Card Header */}
                  <div className="admin-inventory-card-header">

                    <h3>
                      Menu Item #{item.menu_item_id}
                    </h3>

                    <span
                      className={`inventory-stock-badge ${stockClass}`}
                    >
                      {stockText}
                    </span>

                  </div>

                  {/* Inventory Details */}
                  <div className="admin-inventory-details">

                    <div className="admin-inventory-detail">
                      <span>Current Stock</span>

                      <strong>
                        {item.current_stock}
                      </strong>
                    </div>

                    <div className="admin-inventory-detail">
                      <span>Minimum Threshold</span>

                      <strong>
                        {item.min_threshold}
                      </strong>
                    </div>

                  </div>

                  {/* Low Stock Warning */}
                  {isLowStock && (
                    <div className="admin-low-stock-warning">
                      ⚠ Stock is at or below the minimum
                      threshold.
                    </div>
                  )}

                  {/* Update Inventory */}
                  <div className="admin-inventory-update">

                    <label>
                      Current Stock
                    </label>

                    <div className="admin-inventory-update-row">

                      <input
                        className="admin-inventory-input"
                        type="number"
                        min="0"
                        value={
                          stockInput.current_stock
                        }
                        onChange={(e) =>
                          handleStockChange(
                            item.menu_item_id,
                            "current_stock",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <label>
                      Minimum Threshold
                    </label>

                    <div className="admin-inventory-update-row">

                      <input
                        className="admin-inventory-input"
                        type="number"
                        min="0"
                        value={
                          stockInput.min_threshold
                        }
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
                      className="admin-inventory-button"
                      onClick={() =>
                        updateInventory(
                          item.menu_item_id
                        )
                      }
                    >
                      Update Stock
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Record Waste */}
      <section className="admin-inventory-section">

        <div className="admin-inventory-section-header">
          <h2>Record Daily Waste</h2>

          <p>
            Record how much food was prepared, sold,
            and wasted.
          </p>
        </div>

        <form
          className="admin-waste-form"
          onSubmit={submitWaste}
        >

          <div className="admin-waste-field">
            <label htmlFor="menu-item-id">
              Menu Item ID
            </label>

            <input
              id="menu-item-id"
              type="number"
              name="menu_item_id"
              min="1"
              value={wasteForm.menu_item_id}
              onChange={handleWasteChange}
              required
            />
          </div>

          <div className="admin-waste-field">
            <label htmlFor="waste-date">
              Date
            </label>

            <input
              id="waste-date"
              type="date"
              name="date"
              value={wasteForm.date}
              onChange={handleWasteChange}
              required
            />
          </div>

          <div className="admin-waste-field">
            <label htmlFor="prepared-qty">
              Prepared Quantity
            </label>

            <input
              id="prepared-qty"
              type="number"
              name="prepared_qty"
              min="0"
              value={wasteForm.prepared_qty}
              onChange={handleWasteChange}
              required
            />
          </div>

          <div className="admin-waste-field">
            <label htmlFor="sold-qty">
              Sold Quantity
            </label>

            <input
              id="sold-qty"
              type="number"
              name="sold_qty"
              min="0"
              value={wasteForm.sold_qty}
              onChange={handleWasteChange}
              required
            />
          </div>

          <div className="admin-waste-field">
            <label htmlFor="wasted-qty">
              Wasted Quantity
            </label>

            <input
              id="wasted-qty"
              type="number"
              name="wasted_qty"
              min="0"
              value={wasteForm.wasted_qty}
              onChange={handleWasteChange}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-inventory-button admin-waste-submit"
          >
            Record Waste
          </button>

        </form>

      </section>

      {/* Waste History */}
      <section className="admin-inventory-section">

        <div className="admin-inventory-section-header">
          <h2>Waste History</h2>

          <p>
            Historical prepared, sold, and wasted
            quantities.
          </p>
        </div>

        {wasteRecords.length === 0 ? (
          <div className="admin-inventory-empty">
            <p>No waste records found.</p>
          </div>
        ) : (
          <div className="admin-waste-table-wrapper">

            <table className="admin-waste-table">

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
                    <td>
                      #{record.menu_item_id}
                    </td>
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

    </div>
  );
};

export default AdminInventory;

