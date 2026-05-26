import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, suspended: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/vendors?status=pending");
      setVendors(res.data.data);
      // refresh analytics counts too
      await loadAnalytics();
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [p, a, s] = await Promise.all([
        api.get("/admin/vendors?status=pending"),
        api.get("/admin/vendors?status=approved"),
        api.get("/admin/vendors?status=suspended"),
      ]);
      setStats({
        pending: (p.data.data || []).length,
        approved: (a.data.data || []).length,
        suspended: (s.data.data || []).length,
      });
    } catch (err) {
      // don't block main view on analytics failure
      console.warn("Failed to load admin analytics", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/vendors/${id}/approve`);
      toast.success("Vendor approved");
      load();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const suspend = async (id) => {
    try {
      await api.patch(`/admin/vendors/${id}/suspend`);
      toast.success("Vendor suspended");
      load();
    } catch (err) {
      toast.error("Failed to suspend");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#0b0b0b] rounded-xl min-h-screen">
      <h1 className="font-heading font-bold text-3xl text-white mb-4">
        Admin Dashboard
      </h1>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/6">
          <div className="text-sm text-white/60">Pending vendors</div>
          <div className="font-heading text-2xl text-white font-bold">
            {stats.pending}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/6">
          <div className="text-sm text-white/60">Approved vendors</div>
          <div className="font-heading text-2xl text-white font-bold">
            {stats.approved}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/6">
          <div className="text-sm text-white/60">Suspended vendors</div>
          <div className="font-heading text-2xl text-white font-bold">
            {stats.suspended}
          </div>
        </div>
      </div>

      <h2 className="font-heading text-xl text-white/70 mb-4">
        Pending vendor registrations
      </h2>
      {loading ? (
        <div className="text-white/40">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vendors.length === 0 && (
            <div className="text-white/40">No pending vendors</div>
          )}
          {vendors.map((v) => (
            <div
              key={v._id}
              className="card-dark border p-4 rounded-2xl flex items-center justify-between"
            >
              <div>
                <div className="font-heading font-bold text-white">
                  {v.businessName}
                </div>
                <div className="font-body text-white/40 text-sm">
                  {v.ownerName} · {v.email} · {v.phone}
                </div>
                <div className="font-body text-white/40 text-sm mt-2">
                  {v.address}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(v._id)} className="btn-primary">
                  Approve
                </button>
                <button onClick={() => suspend(v._id)} className="btn-outline">
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
