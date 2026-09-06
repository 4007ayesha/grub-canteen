import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./FeedbackForm.css";

function FeedbackForm({ orderId, onSubmitted }) {
  const { token } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          rating: Number(rating),
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit feedback");
      }

      setMessage("Thank you for your feedback! ❤️");
      setComment("");

      if (onSubmitted) {
        onSubmitted(data);
      }
    } catch (err) {
      setError(err.message || "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-form">
      <h3>Leave Feedback</h3>

      <form onSubmit={handleSubmit}>
        <div className="feedback-rating">
          <label htmlFor={`rating-${orderId}`}>Rating</label>

          <select
            id={`rating-${orderId}`}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very Poor</option>
          </select>
        </div>

        <div className="feedback-comment">
          <label htmlFor={`comment-${orderId}`}>Comment</label>

          <textarea
            id={`comment-${orderId}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            rows="4"
          />
        </div>

        {message && (
          <p className="feedback-success">
            {message}
          </p>
        )}

        {error && (
          <p className="feedback-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="feedback-submit"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;