import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const data = await login(values); // cookie/JWT set
      if (data?.message) alert(data.message);

      const me = await api.get("/auth/me");
      const role = (
        me?.data?.role ??
        me?.data?.user?.role ??
        ""
      ).toString().toLowerCase();

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/apply", { replace: true });
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register("email", { required: true })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" {...register("password", { required: true })} />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
