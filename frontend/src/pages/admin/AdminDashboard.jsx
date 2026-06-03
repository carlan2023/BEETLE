import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Store,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronRight,
  Activity,
  Download,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import VendorDetailModal from "./VendorDetailModal";

// Simple Chart Component
function SimpleBarChart({ data, height = 200 }) {
  if (!data || data.length === 0)
    return <div className="text-white/40 text-sm">No data</div>;

  const maxValue = Math.max(...data.map((d) => d.value));
  const scale = (height - 40) / (maxValue || 1);

  return (
    <div className="flex items-end gap-2 h-48 px-4 py-4">
      {data.slice(-7).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t"
            style={{
              height: Math.max(5, d.value * scale) + "px",
            }}
          />
          <span className="text-xs text-white/40">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart Component
function SimplePieChart({ data }) {
  if (!data || Object.keys(data).length === 0)
    return <div className="text-white/40 text-sm">No data</div>;

  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([status, count]) => (
        <div key={status} className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${colors[status] || "bg-gray-500"}`}
          />
          <span className="text-white/60 text-sm capitalize">{status}</span>
          <span className="text-white font-semibold">
            {count} ({Math.round((count / total) * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, revenueRes, vendorsRes, ordersRes, healthRes] =
        await Promise.all([
          api.get("/admin/analytics"),
          api.get("/admin/analytics/revenue?days=30"),
          api.get("/admin/analytics/top-vendors?limit=5"),
          api.get("/admin/orders/recent?limit=10"),
          api.get("/admin/health"),
        ]);

      setAnalytics(analyticsRes.data.data);
      setRevenueData(revenueRes.data.data);
      setTopVendors(vendorsRes.data.data);
      setRecentOrders(ordersRes.data.data);
      setHealth(healthRes.data.data);

      // Load vendors for active tab
      await loadVendors(activeTab);
    } catch (err) {
      console.error("Load data error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async (status) => {
    try {
      const res = await api.get(`/admin/vendors?status=${status}&limit=20`);
      setVendors(res.data.data);
    } catch (err) {
      console.error("Load vendors error:", err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await api.get("/admin/vendors/search", {
        params: { q: query, status: activeTab },
      });
      setSearchResults(res.data.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await api.patch(`/admin/vendors/${id}/approve`);
      toast.success("Vendor approved");
      setActiveTab(activeTab); // Reload
      await loadVendors(activeTab);
    } catch (err) {
      toast.error("Failed to approve vendor");
    }
  };

  const suspend = async (id) => {
    try {
      await api.patch(`/admin/vendors/${id}/suspend`);
      toast.success("Vendor suspended");
      awhandleDateRangeChange = async (type, value) => {
    const newRange = { ...dateRange, [type]: value };
    setDateRange(newRange);

    if (newRange.startDate && newRange.endDate) {
      setLoadingRevenue(true);
      try {
        const res = await api.get("/admin/analytics/revenue", {
          params: {
            startDate: newRange.startDate,
            endDate: newRange.endDate,
          },
        });
        setRevenueData(res.data.data);
      } catch (err) {
        console.error("Failed to load revenue data:", err);
        toast.error("Failed to load revenue data");
      } finally {
        setLoadingRevenue(false);
      }
    }
  };

  const exportVendorsCSV = () => {
    window.location.href = `/api/admin/vendors/export/csv?status=${activeTab}`;
    toast.success("Exporting vendors...");
  };

  const exportOrdersCSV = () => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append("startDate", dateRange.startDate);
    if (dateRange.endDate) params.append("endDate", dateRange.endDate);
    window.location.href = `/api/admin/orders/export/csv?${params.toString()}`;
    toast.success("Exporting orders...");
  };t.error("Failed to suspend vendor");
    }
  };

  const displayVendors = searchQuery ? searchResults : vendors;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-heading font-bold text-4xl mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/40">Platform overview & management</p>
          </div>
          {health && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <Activity size={16} className="text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                System Healthy
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-white/40 text-center py-12">Loading...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Revenue",
                  value: `UGX ${(analytics?.totalRevenue || 0).toLocaleString()}`,
                  icon: TrendingUp,
                  color: "from-green-500 to-green-600",
                  subtext: `${analytics?.orderStatus?.delivered || 0} delivered orders`,
                },
                {
                  label: "Total Orders",
                  value: analytics?.totalOrders || 0,
                  icon: ShoppingBag,
                  color: "from-blue-500 to-blue-600",
                  subtext: `${
                    Object.values(analytics?.orderStatus || {}).reduce(
                      (a, b) => a + b,
                      0,
                    ) || 0
                  } total`,
                },
                {
                  label: "Active Vendors",
                  value: analytics?.vendorStats?.approved || 0,
                  icon: Store,
                  color: "from-orange-500 to-orange-600",
                  subtext: `${analytics?.totalVendors || 0} registered`,
                },
                {
                  label: "Total Customers",
                  value: analytics?.totalCustomers || 0,
                  icon: Users,
                  color: "from-purple-500 to-purple-600",
                  subtext: `${analytics?.totalProducts || 0} products`,
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${card.color} p-px rounded-lg`}
                  >
                    <div className="bg-[#0A0A0A] rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-white/60 text-sm">{card.label}</p>
                          <p className="font-heading font-bold text-2xl mt-1">
                            {card.value}
                          </p>
                        </div>
                        <Icon className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-white/40 text-xs">{card.subtext}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vendor Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Pending Approval",
                  count: analytics?.vendorStats?.pending || 0,
                  icon: AlertCircle,
                  color: "text-yellow-400",
                  bgColor: "bg-yellow-500/10 border-yellow-500/30",
                },
                {
                  label: "Approved",
                  count: analytics?.vendorStats?.approved || 0,
                  icon: CheckCircle,
                  color: "text-green-400",
                  bgColor: "bg-green-500/10 border-green-500/30",
                },
                {
                  label: "Suspended",
                 div className="flex justify-between items-center mb-4">
                  <h2 className="font-heading font-semibold text-lg">
                    Revenue Trend
                  </h2>
                  <button
                    onClick={exportOrdersCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg text-white/70 hover:text-white text-sm transition-colors"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>

                {/* Date Range Picker */}
                <div className="flex gap-4 mb-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        handleDateRangeChange("startDate", e.target.value)
                      }
                      className="bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        handleDateRangeChange("endDate", e.target.value)
                      }
                      className="bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                </div>

                {loadingRevenue ? (
                  <div className="text-white/40 text-center py-8">Loading...</div>
                ) : (
                  <SimpleBarChart
                    data={revenueData.map((d) => ({
                      label: d._id.slice(5),
                      value: d.revenue,
                    }))}
                  />
                )}<div
                    key={i}
                    className={`${stat.bgColor} border rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                      <div>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                        <p
                          className={`font-heading font-bold text-2xl ${stat.color}`}
                        >
                          {stat.count}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
                <h2 className="font-heading font-semibold text-lg mb-4">
                  Revenue Trend (30 days)
                </h2>
                <SimpleBarChart
                  data={revenueData.map((d) => ({
                    label: d._id.slice(5),
                    value: d.revenue,
                  }))}
                />
              </div>

              {/* Order Status */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
                <h2 className="font-heading font-semibold text-lg mb-4">
                  Order Status
                </h2>
                <SimplePieChart data={analytics?.orderStatus || {}} />
              </div>
            </div>

            {/* Top Vendors & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Vendors */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
                <h2 className="font-heading font-semibold text-lg mb-4">
                  Top Vendors
                </h2>
                <div className="space-y-3">
                  {topVendors.map((vendor, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{vendor.businessName}</p>
                        <p className="text-white/40 text-sm">
                          {vendor.totalOrders} orders · {vendor.rating}★
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          UGX {vendor.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {div className="flex justify-between items-center mb-6">
                <h2 className="font-heading font-semibold text-lg">
                  Vendor Management
                </h2>
                <button
                  onClick={exportVendorsCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg text-white/70 hover:text-white text-sm transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-white/[0.05]">
                {["pending", "approved", "suspended"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery("");
                      loadVendors(tab);
                    }}
                    className={`px-4 py-3 capitalize font-semibold transition-colors border-b-2 ${
                      activeTab === tab
                        ? "border-orange-500 text-orange-500"
                        : "border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search vendors by name, email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                {searchLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    Searching...
                  </span>
                )}
              </div>

              {/* Vendor List */}
              <div className="space-y-3">
                {displayVendors.length === 0 ? (
                  <p className="text-white/40 text-center py-8">
                    {searchQuery
                      ? "No vendors found"
                      : "No vendors in this category"}
                  </p>
                ) : (
                  displayVendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          {vendor.businessName}
                        </div>
                        <div className="text-white/40 text-sm">
                          {vendor.ownerName} · {vendor.email} · {vendor.phone}
                        </div>
                        <div className="text-white/40 text-sm mt-1">
                          {vendor.category} · {vendor.address}
                        </div>
                        {vendor.totalOrders > 0 && (
                          <div className="text-white/40 text-xs mt-2">
                            {vendor.totalOrders} orders · UGX{" "}
                            {vendor.totalRevenue.toLocaleString()} revenue
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="text-blue-400 hover:text-blue-300 p-2 border border-blue-500/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                {searchLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                    Searching...
                  </span>
                )}
              </div>

              {/* Vendor List */}
              <div className="space-y-3">
                {displayVendors.length === 0 ? (
                  <p className="text-white/40 text-center py-8">
                    {searchQuery
                      ? "No vendors found"
                      : "No vendors in this category"}
                  </p>
                ) : (
                  displayVendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                 >
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          {vendor.businessName}
                        </div>
                        <div className="text-white/40 text-sm">
                          {vendor.ownerName} · {vendor.email} · {vendor.phone}
                        </div>
                        <div className="text-white/40 text-sm mt-1">
                          {vendor.category} · {vendor.address}
                        </div>
                        {vendor.totalOrders > 0 && (
                          <div className="text-white/40 text-xs mt-2">
                            {vendor.totalOrders} orders · UGX{" "}
                            {vendor.totalRevenue.toLocaleString()} revenue
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => approve(vendor._id)}
                              className="btn-primary text-sm px-4 py-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => suspend(vendor._id)}
                              className="btn-outline text-sm px-4 py-2"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {activeTab === "approved" && (
                          <button
                            onClick={() => suspend(vendor._id)}
                            className="text-red-400 hover:text-red-300 px-4 py-2 border border-red-500/30 rounded-lg text-sm transition-colors"
                          >
                            Suspend
                          </button>
                        )}
                        {activeTab === "suspended" && (
                          <button
                            onClick={() => approve(vendor._id)}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
