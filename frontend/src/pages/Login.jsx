import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import "./Auth.css";

function Login() {
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back!</h1>

        {!user ? (
          <>
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
          </>
        ) : (
          <div>
            <p className="auth-message">
              {message || "You are already logged in."}
            </p>

            <p>
              Role: <strong>{user.role}</strong>
            </p>
          </div>
        )}

        {!user && (
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/Register">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;