import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login details:", {
      email,
      password,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>GRUB CANTEEN</h1>

        <div className="auth-card">
          <h2>Welcome Back!</h2>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              required
            />

            <Button type="submit">
              Login
            </Button>
          </form>

          <p className="auth-link">
            Don't have an account?{" "}
            <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;