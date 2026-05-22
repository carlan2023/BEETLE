import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("beetle-admin");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data?.token) navigate("/admin/dashboard", { replace: true });
    } catch {
      // ignore invalid stored admin token
    }
  }, [navigate]);

  const submit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/admin/login", form);
      const { token, admin } = res.data;
      // store admin token plainly
      localStorage.setItem("beetle-admin", JSON.stringify({ token, admin }));
      toast.success("Welcome, admin");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-6 bg-[#111] border border-white/10 rounded-2xl"
      >
        <h2 className="font-heading text-2xl text-white mb-4">Admin Login</h2>
        <div className="mb-3">
          <label className="block text-white/60 text-xs mb-1">Email</label>
          <input
            className="input-dark w-full"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white/60 text-xs mb-1">Password</label>
          <input
            type="password"
            className="input-dark w-full"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
