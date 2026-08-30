import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Card from "./components/ui/Card";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import FoodDetails from "./pages/FoodDetails";
import { useState } from "react";
import { useCart } from "./context/CartContext";
import CartDrawer from "./components/layout/CartDrawer";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

function Home() {
  const { token, logout } = useAuth();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <h1>Grub Canteen Design System</h1>
      <p>Reusable UI components for the Grub Canteen team.</p>
      <Button onClick={() => setCartOpen(true)}>
        View Cart ({totalItems})
      </Button>
      
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {token && (
        <section className="demo-section">
          <h2>Account</h2>
          <p>You are logged in successfully.</p>

          <Button onClick={logout}>
            Logout
          </Button>
        </section>
      )}

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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

export default App;