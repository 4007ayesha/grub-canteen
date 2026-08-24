import { createContext, useContext, useState } from "react";
import { loginUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("role");

    if (role) {
      return { role };
    }

    return null;
  });

  async function login(email, password) {
    const data = await loginUser({
      email,
      password,
    });

    setToken(data.access_token);

    setUser({
      role: data.role,
    });

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);

    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}