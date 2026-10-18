import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuthShell from "../components/layout/AuthShell";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await login(email, password);

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AuthShell
      title="Welcome Back!"
      subtitle="Login to your Grub Canteen account"
    >
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

        <div className="auth-shell-options">
          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#forgot-password">Forgot password?</a>
        </div>

        <Button type="submit" variant="primary">
          Login
        </Button>
      </form>

      {message && <p className="auth-shell-message">{message}</p>}

      <p className="auth-shell-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </AuthShell>
  );
}

export default Login;