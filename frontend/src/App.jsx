import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import StudentLayout from "./components/layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";

import "./App.css";

import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import AdminInventory from "./pages/AdminInventory";
import AdminAnalytics from "./pages/AdminAnalytics";
import FoodDetails from "./pages/FoodDetails";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* Splash / Public Pages */}
        {/* ========================= */}

        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
          <Route path="/home" element={<Home />} />
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