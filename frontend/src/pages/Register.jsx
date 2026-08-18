import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Registration details:", {
      name,
      email,
      password,
      role: "student",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>GRUB CANTEEN</h1>

        <div className="auth-card">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
              required
            />

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
              Register
            </Button>
          </form>

          <p className="auth-link">
            Already have an account?{" "}
            <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;