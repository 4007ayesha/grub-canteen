export const API_URL = "http://127.0.0.1:8000";

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

export async function getProtectedData(token) {
  const response = await fetch(`${API_URL}/protected`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Unauthorized");
  }

  return data;
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/menu/categories`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load categories");
  }

  return data;
}

export async function getMenuItems(search = "", categoryId = null) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categoryId) params.append("category_id", categoryId);

  const response = await fetch(`${API_URL}/menu/items?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load menu items");
  }

  return data;
}