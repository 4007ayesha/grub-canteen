import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageLayout from "./components/layout/PageLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Card from "./components/ui/Card";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";

import { useAuth } from "./context/AuthContext";
import "./App.css";

import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";
import AdminAnalytics from "./pages/AdminAnalytics";
import FoodDetails from "./pages/FoodDetails";

import { useState } from "react";
import { useCart } from "./context/CartContext";
import CartDrawer from "./components/layout/CartDrawer";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";


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

      <Routes>

        {/* ========================= */}
        {/* Student / Public Pages */}
        {/* ========================= */}

        <Route
          path="/"
          element={
            <PageLayout>
              <Login />
            </PageLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PageLayout>
              <Login />
            </PageLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PageLayout>
              <Register />
            </PageLayout>
          }
        />

        <Route
          path="/menu"
          element={
            <PageLayout>
              <Menu />
            </PageLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <PageLayout>
              <Orders />
            </PageLayout>
          }
        />

        <Route
          path="/food/:id"
          element={
            <PageLayout>
              <FoodDetails />
            </PageLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <PageLayout>
              <Checkout />
            </PageLayout>
          }
        />

        <Route
          path="/order-confirmation"
          element={
            <PageLayout>
              <OrderConfirmation />
            </PageLayout>
          }
        />

        <Route
          path="/order-tracking/:orderId"
          element={
            <PageLayout>
              <OrderTracking />
            </PageLayout>
          }
        />


        {/* ========================= */}
        {/* Admin Pages */}
        {/* ========================= */}

        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/menu"
            element={<AdminMenu />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/inventory"
            element={<AdminInventory />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
