// src/components/NavBar.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, end = false, children }) {
  return (
    <NavLink
      to={to}
      end={end} // 👈 exact match when needed
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm font-medium ${
          isActive ? "bg-brand-600 text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function NavBar() {
  const { user, logout } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        {/* brand → admin ko /admin par le jao, baaki / */}
        <Link to={isAdmin ? "/admin" : "/"} className="font-semibold text-brand-700">
          Admission System
        </Link>

        <nav className="flex items-center gap-2">
          {/* Student-only links */}
          {!isAdmin && (
            <>
              <NavItem to="/apply">Apply</NavItem>
              <NavItem to="/application/status">Status</NavItem>
              <NavItem to="/payment/checkout">Fee Payment</NavItem>
              <NavItem to="/id/virtual">Virtual ID</NavItem>
            </>
          )}

          {/* Admin-only chip + exact dashboard */}
          {isAdmin && (
            <>
              <span className="px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-700">
                Admin
              </span>
              <NavItem to="/admin" end>
                Dashboard
              </NavItem>
            </>
          )}

            {/* Auth buttons */}
          {!user ? (
            <>
              <NavItem to="/auth/register">Register</NavItem>
              <NavItem to="/auth/login">Login</NavItem>
              {/* Admin login (public) */}
              <NavItem to="/admin/login" end>
                Admin Login
              </NavItem>
            </>
          ) : (
            <>
              {!isAdmin && (
                <span className="px-3 text-sm">Welcome, {user?.name || "User"}</span>
              )}
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-red-500 text-white"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
