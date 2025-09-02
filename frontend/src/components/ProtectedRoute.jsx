// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ProtectedRoute({ children, role, redirectTo = "/auth/login" }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const me = await api.get("/auth/me"); // cookie based
        const u = me?.data?.user || me?.data || {};
        const r = (u.role || "").toString().toLowerCase();

        if (role) {
          if (r === role.toLowerCase()) {
            isMounted && setOk(true);
          } else {
            isMounted && setOk(false);
          }
        } else {
          // only auth required, role not enforced
          isMounted && setOk(Boolean(u && (u._id || u.id)));
        }
      } catch {
        isMounted && setOk(false);
      } finally {
        isMounted && setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [role]);

  if (loading) return <div className="container py-10 text-sm text-gray-500">Checking access…</div>;
  if (!ok) return <Navigate to={redirectTo} replace />;
  return children;
}
