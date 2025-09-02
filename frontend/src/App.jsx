import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Apply from "./pages/Apply";
import ApplicationStatus from "./pages/ApplicationStatus";
import PaymentCheckout from "./pages/PaymentCheckout";
import VirtualID from "./pages/VirtualID";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";  // 👈 add this
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 new guard

export default function App() {
  return (
    <AuthProvider>
      <div>
        <NavBar />
        <main className="container py-6">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Admin login is public (no guard) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student-protected */}
            <Route
              path="/apply"
              element={
                <ProtectedRoute redirectTo="/auth/login">
                  <Apply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application/status"
              element={
                <ProtectedRoute redirectTo="/auth/login">
                  <ApplicationStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/checkout"
              element={
                <ProtectedRoute redirectTo="/auth/login">
                  <PaymentCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/id/virtual"
              element={
                <ProtectedRoute redirectTo="/auth/login">
                  <VirtualID />
                </ProtectedRoute>
              }
            />

            {/* Admin-protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin" redirectTo="/admin/login">
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
