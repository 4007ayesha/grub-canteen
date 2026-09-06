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

export async function createMenuItem(item, token) {
  const response = await fetch(`${API_URL}/menu/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create item");
  }

  return data;
}

export async function updateMenuItem(itemId, item, token) {
  const response = await fetch(`${API_URL}/menu/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update item");
  }

  return data;
}

export async function deleteMenuItem(itemId, token) {
  const response = await fetch(`${API_URL}/menu/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete item");
  }

  return data;
}

export async function getMenuItem(itemId) {
  const response = await fetch(`${API_URL}/menu/items/${itemId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load item");
  }

  return data;
}

export async function mockPay(amount, method, token) {
  const response = await fetch(`${API_URL}/payment/mock-pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, method }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Payment request failed");
  }

  return data;
}

export async function createOrder(orderData, token) {
  const response = await fetch(`${API_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create order");
  }

  return data;
}

export async function createPrediction(predictionData, token) {
  const response = await fetch(`${API_URL}/predictions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(predictionData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to generate prediction");
  }

  return data;
}

export async function getPredictions(token) {
  const response = await fetch(`${API_URL}/predictions/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load predictions");
  }

  return data;
}

export async function updatePredictionActual(predictionId, actualQty, token) {
  const response = await fetch(
    `${API_URL}/predictions/${predictionId}/actual?actual_qty=${actualQty}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update actual quantity");
  }

  return data;
}