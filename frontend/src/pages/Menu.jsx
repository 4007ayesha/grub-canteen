import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMenuItems, getCategories } from "../api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import "./Menu.css";

function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    getMenuItems(search, selectedCategory)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      });
  }, [search, selectedCategory]);

  return (
    <div className="menu-page">
      <h1>Menu</h1>

      <Input
        name="search"
        placeholder="Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="menu-categories">
        <button
          className={`menu-chip ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-chip ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p>Loading menu...</p>}

      {!loading && error && <p className="menu-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No food items found.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="menu-grid">
          {items.map((item) => (
          <Link
             key={item.id}
             to={`/food/${item.id}`}
             className="menu-item-link"
>
            <Card className="menu-item-card">
              {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="menu-item-image"
              />
            )}

            <h3>{item.name}</h3>

            {item.description && <p>{item.description}</p>}

            <div className="menu-item-footer">
              <strong>₹{item.price}</strong>
              {!item.available && <Badge variant="warning">Unavailable</Badge>}
            </div>
          </Card>
        </Link>  
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;