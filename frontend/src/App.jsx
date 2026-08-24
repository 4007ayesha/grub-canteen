import PageLayout from "./components/layout/PageLayout";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Card from "./components/ui/Card";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function App() {
  const { token, logout } = useAuth();

  return (
    <PageLayout>
      <Login />

      <hr />

      <Register />

      {token && (
        <>
          <hr />

          <section className="demo-section">
            <h2>Account</h2>

            <p>You are logged in successfully.</p>

            <Button onClick={logout}>
              Logout
            </Button>
          </section>
        </>
      )}

      <hr />

      <h1>Grub Canteen Design System</h1>
      <p>Reusable UI components for the Grub Canteen team.</p>

      <section className="demo-section">
        <h2>Buttons</h2>

        <div className="demo-row">
          <Button>Primary Button</Button>

          <Button variant="secondary">
            Secondary Button
          </Button>
        </div>
      </section>

      <section className="demo-section">
        <h2>Input</h2>

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
        />
      </section>

      <section className="demo-section">
        <h2>Card</h2>

        <Card>
          <h3>Veg Burger</h3>
          <p>Fresh vegetable burger</p>
          <strong>₹50</strong>
        </Card>
      </section>
    </PageLayout>
  );
}

export default App;