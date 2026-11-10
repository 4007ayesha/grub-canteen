import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPopularItems } from "../api";

// Returns the menu items that rank highest in the admin "Popular Items" chart.
// If that ranking can't be loaded (or nothing matches), it falls back to the
// first items on the menu so the section is never empty.
function usePopularItems(items, limit = 4) {
  const { token } = useAuth();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    if (!token) return;

    getPopularItems(token)
      .then((data) => setRanking(Array.isArray(data) ? data : []))
      .catch(() => setRanking([]));
  }, [token]);

  return useMemo(() => {
    if (!items || items.length === 0) return [];

    const picked = [];

    ranking.forEach((entry) => {
      const entryName = String(entry.name || "").trim().toLowerCase();
      const match = items.find(
        (item) => item.name.trim().toLowerCase() === entryName
      );

      if (match && !picked.some((p) => p.id === match.id)) {
        picked.push(match);
      }
    });

    if (picked.length === 0) {
      return items.slice(0, limit);
    }

    return picked.slice(0, limit);
  }, [items, ranking, limit]);
}

export default usePopularItems;
