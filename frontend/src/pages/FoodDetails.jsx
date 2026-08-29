import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMenuItem } from "../api";
import { useCart } from "../context/CartContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import "./FoodDetails.css";

function FoodDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setAdded(false);

    getMenuItem(id)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load this item.");
        setLoading(false);
      });
  }, [id]);

  function handleAddToCart() {
    addToCart(item);
    setAdded(true);
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="menu-error">{error}</p>;
  if (!item) return null;

  return (
    <div className="food-details-page">
      <Link to="/menu">← Back to Menu</Link>

      <Card className="food-details-card">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="food-details-image"
          />
        )}

        <h1>{item.name}</h1>

        {item.description && <p>{item.description}</p>}

        <strong className="food-details-price">
          ₹{item.price}
        </strong>

        {!item.available && (
          <p className="menu-error">Currently unavailable</p>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={!item.available}
        >
          Add to Cart
        </Button>

        {added && (
          <p className="food-details-added">
            Added to cart!
          </p>
        )}
      </Card>
    </div>
  );
}

export default FoodDetails;