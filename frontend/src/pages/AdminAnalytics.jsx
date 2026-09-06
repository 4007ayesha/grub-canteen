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

    </div>
  );
}

export default AdminAnalytics;