import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    try {
      await login(email, password);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      <h1>Grub Canteen</h1>
      <h2>Welcome Back!</h2>

      {!user ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <br />

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <br />

          <div>
            <label>Password</label>
            <br />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <br />

          <button type="submit">
            Login
          </button>
        </form>
      ) : (
        <div>
          <p>{message || "You are already logged in."}</p>
          <p>
            Role: <strong>{user.role}</strong>
          </p>
        </div>
      )}

      {!user && message && <p>{message}</p>}
    </div>
  );
}

export default Login;