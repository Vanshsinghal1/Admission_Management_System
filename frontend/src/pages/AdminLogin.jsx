import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // if already admin → go dashboard
  useEffect(() => {
    (async () => {
      try {
        const roleCtx = (user?.role || "").toLowerCase();
        if (roleCtx === "admin") {
          navigate("/admin", { replace: true });
          return;
        }
        const me = await api.get("/auth/me");
        const role = (
          me?.data?.role ??
          me?.data?.user?.role ??
          ""
        ).toString().toLowerCase();
        if (role === "admin") navigate("/admin", { replace: true });
      } catch {}
    })();
  }, [user, navigate]);

  const onSubmit = async (values) => {
    try {
      // reuse normal login endpoint so cookie set ho
      await login(values);
      const me = await api.get("/auth/me");
      const role = (
        me?.data?.role ??
        me?.data?.user?.role ??
        ""
      ).toString().toLowerCase();

      if (role !== "admin") {
        alert("Not an admin account");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Admin Login</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            {...register("email", { required: true })}
            defaultValue="admin@gmail.com"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            {...register("password", { required: true })}
            defaultValue="Admin@123"
          />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
