import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminPage, { AdminPageHeader } from "../components/layout/AdminPage";
import { Squiggle } from "../components/layout/Decor";
import "./AdminInventory.css";

const AdminInventory = () => {
  const { token } = useAuth();

  const [wasteRecords, setWasteRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Waste form
  const [wasteForm, setWasteForm] = useState({
    menu_item_id: "",
    date: new Date().toISOString().split("T")[0],
    prepared_qty: "",
    sold_qty: "",
    wasted_qty: "",
  });

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

      await fetchWasteRecords();

      setLoading(false);
    };

    loadData();
  }, [token]);

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
        <p className="adm-status-text">Loading waste records...</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Inventory Management"
        subtitle="Record daily food waste and review the history."
      />

      {message && <div className="adm-message">{message}</div>}
      {error && <div className="adm-error">{error}</div>}

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

          <button type="submit" className="adm-btn inv-submit">
            Record Waste
          </button>
        </form>
      </section>

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