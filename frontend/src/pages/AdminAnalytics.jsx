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
import AdminPage, { AdminPageHeader } from "../components/layout/AdminPage";
import { Squiggle, LeafIcon } from "../components/layout/Decor";
import "./AdminAnalytics.css";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ForkIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}>
      <path d="M3 2v7c0 1.1.9 2 2 2h1a2 2 0 0 0 2-2V2" />
      <path d="M6 11v11" />
      <path d="M18 2a4 4 0 0 0-4 4v4h4" />
      <path d="M18 10v12" />
    </svg>
  );
}

function HatIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}>
      <path d="M6 14a4 4 0 1 1 1.5-7.7A4.5 4.5 0 0 1 16.5 6.3 4 4 0 1 1 18 14v5H6z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function ClipboardIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 1v4M16 1v4M8 11h8M8 15h5" />
    </svg>
  );
}

function TrashIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function LineChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...iconProps}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E3A857" stroke="#E3A857" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

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
  const [actualError, setActualError] = useState("");

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

        const [summaryData, popularData, trendData, feedbackData, wasteData] =
          await Promise.all([
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
        setPredictionsError("Unable to load predictions. Please try again.");
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

    if (predicting) return;

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
      setPredictionFormError(err.message || "Unable to generate prediction.");
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

    const numValue = Number(value);

    if (isNaN(numValue) || numValue < 0) {
      setActualError("Actual quantity must be a valid number, 0 or greater.");
      return;
    }

    try {
      setActualError("");
      setSavingActualId(predictionId);

      const updated = await updatePredictionActual(
        predictionId,
        numValue,
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
      setActualError(err.message || "Unable to save actual quantity.");
    } finally {
      setSavingActualId(null);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <p className="adm-status-text">Loading analytics...</p>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage>
        <div className="adm-error">{error}</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Analytics"
        subtitle="Monitor orders, sales, customer feedback, and food waste."
      />

      {/* Summary cards */}
      <div className="ana-summary">
        <div className="adm-card ana-stat">
          <span className="ana-stat-icon">₹</span>
          <div>
            <span className="ana-stat-label">Total Revenue</span>
            <strong className="ana-stat-value">
              ₹{Number(summary?.total_revenue || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="adm-card ana-stat">
          <span className="ana-stat-icon">
            <ForkIcon />
          </span>
          <div>
            <span className="ana-stat-label">Total Orders</span>
            <strong className="ana-stat-value">
              {summary?.total_orders || 0}
            </strong>
          </div>
        </div>

        <div className="adm-card ana-stat">
          <span className="ana-stat-icon">
            <HatIcon />
          </span>
          <div>
            <span className="ana-stat-label">Pending Orders</span>
            <strong className="ana-stat-value">
              {summary?.pending_orders || 0}
            </strong>
          </div>
        </div>

        <div className="adm-card ana-stat">
          <span className="ana-stat-icon">
            <ClipboardIcon />
          </span>
          <div>
            <span className="ana-stat-label">Menu Items</span>
            <strong className="ana-stat-value">
              {summary?.total_menu_items || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="ana-charts">
        <div className="adm-card ana-chart-card">
          <h2 className="ana-card-title">
            <LineChartIcon />
            Order Trend
          </h2>
          <p className="ana-card-sub">Orders placed by date.</p>

          {orderTrend.length === 0 ? (
            <div className="ana-empty">No order data available yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={orderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0d5dc" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#E96F91"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#E96F91" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="adm-card ana-chart-card">
          <h2 className="ana-card-title">
            <BarChartIcon />
            Popular Items
          </h2>
          <p className="ana-card-sub">Top 5 best-selling items.</p>

          {popularItems.length === 0 ? (
            <div className="ana-empty">No sales data available yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={popularItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0d5dc" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="total_sold"
                  fill="#F29BB4"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Food Waste */}
      <section>
        <h2 className="adm-section-title ana-section-gap">
          <Squiggle size={26} />
          Food Waste
        </h2>

        <div className="ana-waste-grid">
          <div className="adm-card ana-waste-tile">
            <span className="ana-waste-icon">
              <HatIcon size={30} />
            </span>
            <span className="ana-waste-label">Prepared</span>
            <strong>{waste?.total_prepared || 0}</strong>
          </div>

          <div className="adm-card ana-waste-tile">
            <span className="ana-waste-icon">
              <ForkIcon size={30} />
            </span>
            <span className="ana-waste-label">Sold</span>
            <strong>{waste?.total_sold || 0}</strong>
          </div>

          <div className="adm-card ana-waste-tile">
            <span className="ana-waste-icon">
              <TrashIcon size={30} />
            </span>
            <span className="ana-waste-label">Wasted</span>
            <strong>{waste?.total_wasted || 0}</strong>
          </div>

          <div className="adm-card ana-waste-tile">
            <span className="ana-waste-icon">
              <LeafIcon size={30} />
            </span>
            <span className="ana-waste-label">Waste Rate</span>
            <strong>{Number(waste?.waste_percentage || 0).toFixed(2)}%</strong>
          </div>
        </div>
      </section>

      {/* Customer Feedback */}
      <section>
        <h2 className="adm-section-title ana-section-gap">
          <Squiggle size={26} />
          Customer Feedback
        </h2>

        <div className="adm-card ana-feedback">
          <div className="ana-feedback-score">
            <strong>{Number(feedback?.average_rating || 0).toFixed(2)}</strong>
            <span>/5</span>
            <StarIcon />
          </div>
          <p>
            Based on {feedback?.total_feedback || 0} feedback submissions
          </p>
        </div>
      </section>

      {/* Demand Prediction */}
      <section className="adm-card ana-pred">
        <h2 className="adm-section-title">
          <Squiggle size={26} />
          Demand Prediction
        </h2>
        <p className="ana-card-sub ana-pred-sub">
          AI-powered food demand forecasting.
        </p>

        <form className="ana-pred-form" onSubmit={submitPrediction}>
          <div className="adm-field">
            <label htmlFor="pred-menu-item">Menu Item</label>
            <select
              id="pred-menu-item"
              className="adm-select"
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

          <div className="adm-field">
            <label htmlFor="pred-date">Date</label>
            <input
              id="pred-date"
              className="adm-input"
              type="date"
              name="date"
              value={predictionForm.date}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="pred-prev-sales">Previous Day Sales</label>
            <input
              id="pred-prev-sales"
              className="adm-input"
              type="number"
              min="0"
              name="previous_day_sales"
              value={predictionForm.previous_day_sales}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="pred-avg">7-Day Average</label>
            <input
              id="pred-avg"
              className="adm-input"
              type="number"
              min="0"
              step="0.1"
              name="seven_day_avg"
              placeholder="Enter average"
              value={predictionForm.seven_day_avg}
              onChange={handlePredictionFormChange}
              required
            />
          </div>

          <label className="ana-check" htmlFor="pred-holiday">
            <input
              id="pred-holiday"
              type="checkbox"
              name="is_holiday"
              checked={predictionForm.is_holiday}
              onChange={handlePredictionFormChange}
            />
            Holiday
          </label>

          <label className="ana-check" htmlFor="pred-event">
            <input
              id="pred-event"
              type="checkbox"
              name="is_college_event"
              checked={predictionForm.is_college_event}
              onChange={handlePredictionFormChange}
            />
            College Event
          </label>

          {predictionFormError && (
            <div className="adm-error ana-pred-wide">{predictionFormError}</div>
          )}

          <button
            type="submit"
            className="adm-btn ana-pred-submit"
            disabled={predicting}
          >
            {predicting ? "Predicting..." : "Predict Demand"}
          </button>
        </form>

        {predictionResult && (
          <div className="ana-pred-result">
            <span>AI Demand Prediction</span>
            <strong>{predictionResult.predicted_qty} items</strong>
            <small>
              For {getItemName(predictionResult.menu_item_id)} ·{" "}
              {predictionResult.date}
            </small>
          </div>
        )}

        <div className="ana-pred-history">
          <h3 className="ana-card-title">
            <Squiggle size={22} />
            Prediction History
          </h3>

          {actualError && <div className="adm-error">{actualError}</div>}

          {predictionsLoading ? (
            <p className="adm-status-text">Loading predictions...</p>
          ) : predictionsError ? (
            <div className="adm-error">{predictionsError}</div>
          ) : predictions.length === 0 ? (
            <div className="ana-empty">No predictions yet.</div>
          ) : (
            <div className="adm-table-wrap ana-table-card">
              <table className="adm-table">
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
                          <div className="ana-actual">
                            <input
                              className="adm-input"
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
                              className="adm-btn"
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
    </AdminPage>
  );
}

export default AdminAnalytics;