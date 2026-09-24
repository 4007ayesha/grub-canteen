import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageLayout from "./components/layout/PageLayout";
import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import Home from "./pages/Home";

import { useAuth } from "./context/AuthContext";
import "./App.css";

import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";
import AdminAnalytics from "./pages/AdminAnalytics";
import FoodDetails from "./pages/FoodDetails";

import { useCart } from "./context/CartContext";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";

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

        {/* ========================= */}
        {/* Student Pages (Sidebar)   */}
        {/* ========================= */}

        <Route
  element={
    <ProtectedRoute>
      <StudentLayout />
    </ProtectedRoute>
  }
>
  <Route path="/" element={<Home />} />
  <Route path="/menu" element={<Menu />} />
  <Route path="/orders" element={<Orders />} />
  <Route path="/food/:id" element={<FoodDetails />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/order-confirmation" element={<OrderConfirmation />} />
  <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
</Route>
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
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;