import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import { getMenuItems, getCategories } from "../../api";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import "./SearchOverlay.css";

function SearchOverlay() {
  const { searchQuery, setSearchQuery, searchActive, setSearchActive } =
    useSearch();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasQuery = searchQuery.trim().length > 0 || selectedCategory !== null;

  useEffect(() => {
    if (!searchActive) return;
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [searchActive]);

  useEffect(() => {
    if (!searchActive || !hasQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    const timeoutId = setTimeout(() => {
      getMenuItems(searchQuery, selectedCategory)
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Unable to load results.");
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, searchActive, hasQuery]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") closeOverlay();
    }
    if (searchActive) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [searchActive]);

  function closeOverlay() {
    setSearchActive(false);
    setSearchQuery("");
    setSelectedCategory(null);
  }

  if (!searchActive) return null;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      closeOverlay();
    }
  }

  return (
    <div className="search-overlay" onClick={handleOverlayClick}>
      <div className="search-overlay-panel">
        <input
          type="text"
          className="search-overlay-input"
          placeholder="Search food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />

        <div className="search-overlay-categories">
          <button
            className={`menu-chip ${
              selectedCategory === null ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-chip ${
                selectedCategory === cat.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {hasQuery && loading && (
          <p className="search-overlay-status">Searching...</p>
        )}

        {hasQuery && !loading && error && (
          <p className="search-overlay-status search-overlay-error">
            {error}
          </p>
        )}

        {hasQuery && !loading && !error && results.length === 0 && (
          <p className="search-overlay-status">No food items found.</p>
        )}

        {hasQuery && !loading && !error && results.length > 0 && (
          <div className="search-overlay-grid">
            {results.map((item) => (
              <Link
                key={item.id}
                to={`/food/${item.id}`}
                className="menu-item-link"
                onClick={closeOverlay}
              >
                <Card className="menu-item-card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="menu-item-image"
                    />
                  )}
                  <div className="menu-item-content">
                    <h3>{item.name}</h3>
                    {item.description && <p>{item.description}</p>}
                    <div className="menu-item-footer">
                      <strong>₹{item.price}</strong>
                      {!item.available && (
                        <Badge variant="warning">Unavailable</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchOverlay;