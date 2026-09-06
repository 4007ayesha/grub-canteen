import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "./Auth.css";

function Login() {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await login(email, password);

      setMessage("Login successful!");

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/menu");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Welcome Back!</h1>

          <p className="auth-message">
            You are already logged in.
          </p>

          <p>
            Role: <strong>{user.role}</strong>
          </p>

          {user.role === "admin" ? (
            <Button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
            >
              Go to Admin Dashboard
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => navigate("/menu")}
            >
              Go to Menu
            </Button>
          )}

          <div style={{ marginTop: "20px" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Login to your Grub Canteen account
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#forgot-password">
              Forgot password?
            </a>
          </div>

          <Button type="submit" variant="primary">
            Login
          </Button>
        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;