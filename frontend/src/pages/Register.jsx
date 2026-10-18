import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuthShell from "../components/layout/AuthShell";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await registerUser({
        name,
        email,
        password,
        role: "student",
      });

      setMessage("Registration successful!");
      setIsSuccess(true);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register to start using Grub Canteen"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary">
          Register
        </Button>
      </form>

      {message && (
        <p
          className={`auth-shell-message ${
            isSuccess ? "auth-shell-message-success" : ""
          }`}
        >
          {message}
        </p>
      )}

      <p className="auth-shell-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthShell>
  );
}

export default Register;