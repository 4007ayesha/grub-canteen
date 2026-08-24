import { useState } from "react";
import { registerUser } from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(event) {
    event.preventDefault();

    try {
      await registerUser({
        name,
        email,
        password,
        role: "student",
      });

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      <h1>Grub Canteen</h1>
      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <br />

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
            placeholder="Create a password"
            required
          />
        </div>

        <br />

        <button type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;