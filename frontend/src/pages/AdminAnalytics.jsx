import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import {
  getMenuItems,
  createPrediction,
  getPredictions,
  updatePredictionActual,
} from "../api";
import "./AdminAnalytics.css";

function AdminAnalytics() {
  const { token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [orderTrend, setOrderTrend] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [waste, setWaste] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Phase 16: Demand Prediction state ---
  const [menuItems, setMenuItems] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [predictionsError, setPredictionsError] = useState("");

  const [predictionForm, setPredictionForm] = useState({
    menu_item_id: "",
    date: new Date().toISOString().split("T")[0],
    previous_day_sales: "",
    seven_day_avg: "",
    is_holiday: false,
    is_college_event: false,
  });

  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionFormError, setPredictionFormError] = useState("");

  const [actualInputs, setActualInputs] = useState({});
  const [savingActualId, setSavingActualId] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const [
          summaryResponse,
          popularResponse,
          trendResponse,
          feedbackResponse,
          wasteResponse,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/analytics/summary", { headers }),
          fetch("http://127.0.0.1:8000/analytics/popular-items", { headers }),
          fetch("http://127.0.0.1:8000/analytics/order-trend", { headers }),
          fetch("http://127.0.0.1:8000/analytics/feedback-summary", {
            headers,
          }),
          fetch("http://127.0.0.1:8000/analytics/waste-summary", { headers }),
        ]);

        if (
          !summaryResponse.ok ||
          !popularResponse.ok ||
          !trendResponse.ok ||
          !feedbackResponse.ok ||
          !wasteResponse.ok
        ) {
          throw new Error("Failed to load analytics data.");
        }

        const [
          summaryData,
          popularData,
          trendData,
          feedbackData,
          wasteData,
        ] = await Promise.all([
          summaryResponse.json(),
          popularResponse.json(),
          trendResponse.json(),
          feedbackResponse.json(),
          wasteResponse.json(),
        ]);

        setSummary(summaryData);
        setPopularItems(popularData);
        setOrderTrend(trendData);
        setFeedback(feedbackData);
        setWaste(wasteData);
      } catch (err) {
        console.error("Analytics error:", err);
        setError("Unable to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  // --- Phase 16: load menu items (for names) + saved predictions ---
  useEffect(() => {
    const fetchPredictionData = async () => {
      try {
        setPredictionsLoading(true);
        setPredictionsError("");

        const [items, savedPredictions] = await Promise.all([
          getMenuItems(),
          getPredictions(token),
        ]);

        setMenuItems(items);
        setPredictions(savedPredictions);
      } catch (err) {
        console.error("Prediction data error:", err);
        setPredictionsError(
          "Unable to load predictions. Please try again."
        );
      } finally {
        setPredictionsLoading(false);
      }
    };

    if (token) {
      fetchPredictionData();
    }
  }, [token]);

  const getItemName = (menuItemId) => {
    const item = menuItems.find(
      (m) => m.id === menuItemId || m.id === Number(menuItemId)
    );
    return item ? item.name : `Item #${menuItemId}`;
  };

  const handlePredictionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPredictionForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitPrediction = async (e) => {
    e.preventDefault();

    if (predicting) return; // guard against double-click

    try {
      setPredicting(true);
      setPredictionFormError("");
      setPredictionResult(null);

      if (
        !predictionForm.menu_item_id ||
        !predictionForm.date ||
        predictionForm.previous_day_sales === "" ||
        predictionForm.seven_day_avg === ""
      ) {
        setPredictionFormError("Please fill in all fields.");
        setPredicting(false);
        return;
      }

      const dayOfWeek = new Date(predictionForm.date).getDay();

      const payload = {
        menu_item_id: Number(predictionForm.menu_item_id),
        date: predictionForm.date,
        day_of_week: dayOfWeek,
        previous_day_sales: Number(predictionForm.previous_day_sales),
        seven_day_avg: Number(predictionForm.seven_day_avg),
        is_holiday: predictionForm.is_holiday,
        is_college_event: predictionForm.is_college_event,
      };

      const result = await createPrediction(payload, token);

      setPredictionResult(result);
      setPredictions((current) => [result, ...current]);
    } catch (err) {
      setPredictionFormError(
        err.message || "Unable to generate prediction."
      );
    } finally {
      setPredicting(false);
    }
  };

  const handleActualInputChange = (predictionId, value) => {
    setActualInputs((current) => ({
      ...current,
      [predictionId]: value,
    }));
  };

  const saveActualQty = async (predictionId) => {
    const value = actualInputs[predictionId];

    if (value === undefined || value === "") return;

    try {
      setSavingActualId(predictionId);

      const updated = await updatePredictionActual(
        predictionId,
        Number(value),
        token
      );

      setPredictions((current) =>
        current.map((p) => (p.id === predictionId ? updated : p))
      );

      setActualInputs((current) => {
        const copy = { ...current };
        delete copy[predictionId];
        return copy;
      });
    } catch (err) {
      setPredictionsError(
        err.message || "Unable to save actual quantity."
      );
    } finally {
      setSavingActualId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics-page">
        <div className="analytics-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics-page">

      {/* Header */}
      <div className="admin-analytics-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Monitor orders, sales, customer feedback, and food waste.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary-grid">

        <div className="analytics-card summary-card">
          <span className="summary-card-label">
            Revenue
          </span>

          <strong className="summary-card-value">
            ₹{Number(summary?.total_revenue || 0).toFixed(2)}
          </strong>
        </div>

        <div className="analytics-card summary-card">
          <span className="summary-card-label">
            Total Orders
          </span>

          <strong className="summary-card-value">
            {summary?.total_orders || 0}
          </strong>
        </div>

        <div className="analytics-card summary-card">
          <span className="summary-card-label">
            Pending Orders
          </span>

          <strong className="summary-card-value">
            {summary?.pending_orders || 0}
          </strong>
        </div>

        <div className="analytics-card summary-card">
          <span className="summary-card-label">
            Menu Items
          </span>

          <strong className="summary-card-value">
            {summary?.total_menu_items || 0}
          </strong>
        </div>

      </div>

      {/* Charts */}
      <div className="analytics-charts-grid">

        {/* Order Trend */}
        <div className="analytics-card chart-card">

          <div className="chart-header">
            <div>
              <h2>Order Trend</h2>
              <p>Orders placed by date</p>
            </div>
          </div>

          {orderTrend.length === 0 ? (
            <div className="analytics-empty">
              No order data available yet.
            </div>
          ) : (
            <div className="chart-container">

              <ResponsiveContainer width="100%" height={300}>

                <LineChart data={orderTrend}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>
          )}

        </div>

        {/* Popular Items */}
        <div className="analytics-card chart-card">

          <div className="chart-header">
            <div>
              <h2>Popular Items</h2>
              <p>Top 5 best-selling items</p>
            </div>
          </div>

          {popularItems.length === 0 ? (
            <div className="analytics-empty">
              No sales data available yet.
            </div>
          ) : (
            <div className="chart-container">

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={popularItems}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="total_sold"
                    fill="var(--color-secondary)"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          )}

        </div>

      </div>

      {/* Feedback + Waste */}
      <div className="analytics-info-grid">

        {/* Customer Feedback */}
        <div className="analytics-card info-card">

          <div className="info-card-header">
            <h2>Customer Feedback</h2>

            <span className="info-card-icon">
              ⭐
            </span>
          </div>

          <div className="feedback-content">

            <strong>
              {Number(
                feedback?.average_rating || 0
              ).toFixed(2)}

              <span>/5</span>
            </strong>

            <p>
              Based on{" "}
              {feedback?.total_feedback || 0}{" "}
              feedback submissions
            </p>

          </div>

        </div>

        {/* Food Waste */}
        <div className="analytics-card info-card">

          <div className="info-card-header">
            <h2>Food Waste</h2>

            <span className="info-card-icon">
              ♻️
            </span>
          </div>

          <div className="waste-stats">

            <div>
              <span>Prepared</span>
              <strong>
                {waste?.total_prepared || 0}
              </strong>
            </div>

            <div>
              <span>Sold</span>
              <strong>
                {waste?.total_sold || 0}
              </strong>
            </div>

            <div>
              <span>Wasted</span>
              <strong>
                {waste?.total_wasted || 0}
              </strong>
            </div>

            <div>
              <span>Waste Rate</span>
              <strong>
                {Number(
                  waste?.waste_percentage || 0
                ).toFixed(2)}
                %
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* Phase 16: Demand Prediction */}
      <section className="analytics-card prediction-section">

        <div className="prediction-header">
          <h2>Demand Prediction</h2>
          <p>AI-powered food demand forecasting</p>
        </div>

        <form className="prediction-form" onSubmit={submitPrediction}>

          <div className="prediction-field">
            <label htmlFor="pred-menu-item">Menu Item</label>
            <select
              id="pred-menu-item"
              name="menu_item_id"
              value={predictionForm.menu_item_id}
              onChange={handlePredictionFormChange}
              required
            >
              <option value="">Select food item</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="prediction-field">
            <label htmlFor="pred-date">Date</label>
            <input
              id="pred-date"
              type="date"
              name="date"
              value={predictionForm.date}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <div className="prediction-field">
            <label htmlFor="pred-prev-sales">Previous Day Sales</label>
            <input
              id="pred-prev-sales"
              type="number"
              min="0"
              name="previous_day_sales"
              value={predictionForm.previous_day_sales}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <div className="prediction-field">
            <label htmlFor="pred-avg">7-Day Average</label>
            <input
              id="pred-avg"
              type="number"
              min="0"
              step="0.1"
              name="seven_day_avg"
              value={predictionForm.seven_day_avg}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <div className="prediction-field prediction-field-checkbox">
            <label htmlFor="pred-holiday">Holiday</label>
            <input
              id="pred-holiday"
              type="checkbox"
              name="is_holiday"
              checked={predictionForm.is_holiday}
              onChange={handlePredictionFormChange}
            />
          </div>

          <div className="prediction-field prediction-field-checkbox">
            <label htmlFor="pred-event">College Event</label>
            <input
              id="pred-event"
              type="checkbox"
              name="is_college_event"
              checked={predictionForm.is_college_event}
              onChange={handlePredictionFormChange}
            />
          </div>

          {predictionFormError && (
            <div className="prediction-form-error">
              {predictionFormError}
            </div>
          )}

          <button
            type="submit"
            className="prediction-submit-btn"
            disabled={predicting}
          >
            {predicting ? "Predicting..." : "Predict Demand"}
          </button>

        </form>

        {predictionResult && (
          <div className="prediction-result">
            <span className="prediction-result-label">
              AI Demand Prediction
            </span>
            <strong className="prediction-result-value">
              {predictionResult.predicted_qty} items
            </strong>
            <span className="prediction-result-meta">
              For {getItemName(predictionResult.menu_item_id)} ·{" "}
              {predictionResult.date}
            </span>
          </div>
        )}

        <div className="prediction-history">
          <h3>Prediction History</h3>

          {predictionsLoading ? (
            <div className="analytics-loading">Loading predictions...</div>
          ) : predictionsError ? (
            <div className="analytics-error">{predictionsError}</div>
          ) : predictions.length === 0 ? (
            <div className="analytics-empty">No predictions yet.</div>
          ) : (
            <div className="prediction-table-wrapper">
              <table className="prediction-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Date</th>
                    <th>Predicted</th>
                    <th>Actual</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.id}>
                      <td>{getItemName(p.menu_item_id)}</td>
                      <td>{p.date}</td>
                      <td>{p.predicted_qty}</td>
                      <td>
                        {p.actual_qty !== null && p.actual_qty !== undefined ? (
                          p.actual_qty
                        ) : (
                          <div className="prediction-actual-input">
                            <input
                              type="number"
                              min="0"
                              placeholder="Enter actual"
                              value={actualInputs[p.id] ?? ""}
                              onChange={(e) =>
                                handleActualInputChange(p.id, e.target.value)
                              }
                            />
                            <button
                              type="button"
                              disabled={savingActualId === p.id}
                              onClick={() => saveActualQty(p.id)}
                            >
                              {savingActualId === p.id ? "Saving..." : "Save"}
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {p.actual_qty !== null && p.actual_qty !== undefined
                          ? p.actual_qty - p.predicted_qty >= 0
                            ? `+${p.actual_qty - p.predicted_qty}`
                            : p.actual_qty - p.predicted_qty
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}

export default AdminAnalytics;