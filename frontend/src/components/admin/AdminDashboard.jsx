
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Users, Package, Truck, Leaf, TrendingUp, ShieldCheck,
  Menu, Bell, LogOut, User, ChefHat, ArrowUpRight,
  CheckCircle2, Clock, AlertTriangle, BarChart3,
  Building2, Feather, ShoppingBag, Heart, Activity,
} from "lucide-react";

// ── Static demo data ────────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", meals: 42, waste: 8,  deliveries: 18 },
  { day: "Tue", meals: 58, waste: 5,  deliveries: 24 },
  { day: "Wed", meals: 35, waste: 12, deliveries: 15 },
  { day: "Thu", meals: 71, waste: 3,  deliveries: 31 },
  { day: "Fri", meals: 63, waste: 6,  deliveries: 27 },
  { day: "Sat", meals: 89, waste: 2,  deliveries: 38 },
  { day: "Sun", meals: 54, waste: 9,  deliveries: 22 },
];

const recentActivity = [
  { type: "hotel",  name: "The Grand Hotel",   action: "Listed 20kg Dal Makhani",     time: "2 min ago",  status: "listed"   },
  { type: "robin",  name: "Robin Sharma",       action: "Completed delivery #1042",    time: "8 min ago",  status: "done"     },
  { type: "worker", name: "Ravi Kumar",         action: "Requested Chicken Biryani",   time: "15 min ago", status: "pending"  },
  { type: "user",   name: "Priya Mehta",        action: "Ordered Paneer Butter Masala",time: "22 min ago", status: "ordered"  },
  { type: "hotel",  name: "Spice Garden",       action: "Listed 15kg Veg Pulao",       time: "31 min ago", status: "listed"   },
  { type: "robin",  name: "Amit Kumar",         action: "Accepted route #1043",        time: "45 min ago", status: "active"   },
];

const roleUsers = [
  { role: "Hotels",   count: 24, icon: Building2, color: "text-green-600 bg-green-50",   change: "+3 this week" },
  { role: "Robins",   count: 18, icon: Feather,   color: "text-blue-600 bg-blue-50",     change: "+2 this week" },
  { role: "Workers",  count: 67, icon: Heart,     color: "text-orange-600 bg-orange-50", change: "+8 this week" },
  { role: "Customers",count: 142,icon: ShoppingBag,color: "text-purple-600 bg-purple-50",change: "+21 this week"},
];

const activityTypeConfig = {
  hotel:  { icon: Building2,  color: "bg-green-100 text-green-700"  },
  robin:  { icon: Feather,    color: "bg-blue-100 text-blue-700"    },
  worker: { icon: Heart,      color: "bg-orange-100 text-orange-700"},
  user:   { icon: ShoppingBag,color: "bg-purple-100 text-purple-700"},
};

const statusConfig = {
  listed:  { label: "Listed",   bg: "bg-green-100 text-green-700"  },
  done:    { label: "Done",     bg: "bg-[var(--green-primary)]/10 text-[var(--green-primary)]" },
  pending: { label: "Pending",  bg: "bg-yellow-100 text-yellow-700"},
  ordered: { label: "Ordered",  bg: "bg-purple-100 text-purple-700"},
  active:  { label: "Active",   bg: "bg-blue-100 text-blue-700"   },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-[var(--text-color)] mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--muted-text)] capitalize">{p.dataKey}:</span>
          <span className="font-bold text-[var(--text-color)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const kpis = [
    { label: "Total Meals Saved",   value: "4,821",  icon: Package,    color: "bg-green-50",  iconC: "text-[var(--green-primary)]", change: "+12% this week" },
    { label: "Active Deliveries",   value: "14",     icon: Truck,      color: "bg-blue-50",   iconC: "text-blue-500",               change: "3 critical now" },
    { label: "Waste Prevented (kg)",value: "312",    icon: Leaf,       color: "bg-emerald-50",iconC: "text-emerald-600",            change: "+8% this month" },
    { label: "CSR Impact Score",    value: "91%",    icon: TrendingUp, color: "bg-purple-50", iconC: "text-purple-500",             change: "+4% this month" },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-color-light)] text-[var(--text-color)] overflow-hidden">

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div key="sidebar" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-40 h-full w-72 bg-[var(--card-bg)] border-r border-[rgba(0,0,0,0.07)] shadow-2xl flex flex-col"
            >
              {/* Sidebar logo */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-color)] leading-none">Zarfo</h2>
                    <p className="text-[11px] text-[var(--muted-text)] mt-0.5 font-medium">Admin Console</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] transition-all text-sm">✕</button>
              </div>
              {/* Sidebar nav */}
              <nav className="flex-1 px-3 py-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] px-3 mb-3">Navigation</p>
                {[
                  { label: "Overview",    icon: BarChart3,   tab: "overview"  },
                  { label: "Users",       icon: Users,       tab: "users"     },
                  { label: "Food Ops",    icon: Package,     tab: "food"      },
                  { label: "Deliveries",  icon: Truck,       tab: "deliveries"},
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;
                  return (
                    <button key={item.tab} onClick={() => { setActiveTab(item.tab); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? "bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white shadow-lg" : "text-[var(--text-color)] hover:bg-[var(--bg-color-light)]"
                      }`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : "bg-[var(--green-primary)]/10"}`}>
                        <Icon size={16} className={isActive ? "text-white" : "text-[var(--green-primary)]"} />
                      </div>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 sticky top-0 z-20 bg-[var(--card-bg)] border-b border-[rgba(0,0,0,0.06)] shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--bg-color-light)] transition-all">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-md hidden sm:flex">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-none">Admin Console</h1>
                <p className="text-[10px] text-[var(--muted-text)] mt-0.5 hidden sm:block font-medium">Zarfo Platform Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--bg-color-light)] transition-colors border border-transparent hover:border-[rgba(0,0,0,0.06)]">
                  <Avatar className="w-8 h-8 ring-2 ring-[var(--green-primary)]/30 ring-offset-1">
                    <AvatarImage src="/worker-avatar.png" alt="Admin" />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-none max-w-[90px] truncate">{user?.name || "Admin"}</p>
                    <p className="text-[10px] text-[var(--muted-text)] mt-0.5">Super Admin</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] shadow-2xl rounded-2xl w-52 py-1.5">
                <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)]">
                  <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
                  <p className="text-[11px] text-[var(--muted-text)] truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--bg-color-light)] rounded-xl mx-1.5 mt-1">
                  <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                  </div>Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[rgba(0,0,0,0.06)]" />
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 rounded-xl mx-1.5 mb-1" onClick={handleLogout}>
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="space-y-6 max-w-7xl mx-auto">

            {/* Hero banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-primary)] p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Platform Overview</p>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Good evening, {user?.name?.split(" ")[0] || "Admin"}</h2>
                  <p className="text-white/70 text-sm mt-2 max-w-md leading-relaxed">
                    Platform is running smoothly. 14 active deliveries, 4,821 meals saved this month.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                      <span className="text-white/90 text-xs font-semibold">All systems operational</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                      <Activity className="w-3.5 h-3.5 text-white/80" />
                      <span className="text-white/90 text-xs font-semibold">251 total users</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
                  <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }} whileHover={{ y: -2 }}
                    className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md transition-all p-4 sm:p-5 cursor-default"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                        <Icon className={`w-4 h-4 ${kpi.iconC}`} />
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted-text)] opacity-40" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{kpi.value}</p>
                    <p className="text-[11px] text-[var(--muted-text)] mt-1.5 font-medium leading-tight">{kpi.label}</p>
                    <p className="text-[10px] text-[var(--green-primary)] font-semibold mt-1.5">{kpi.change}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Area chart */}
              <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-color)]">Weekly Platform Activity</h3>
                    <p className="text-[11px] text-[var(--muted-text)] mt-0.5">Meals saved, waste prevented, deliveries</p>
                  </div>
                  <span className="text-[11px] text-[var(--muted-text)] bg-[var(--bg-color-light)] px-3 py-1.5 rounded-xl font-semibold">This Week</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  {[
                    { color: "bg-[var(--green-primary)]", label: "Meals" },
                    { color: "bg-red-400",                label: "Waste (kg)" },
                    { color: "bg-blue-500",               label: "Deliveries" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                      <span className="text-[11px] text-[var(--muted-text)] font-medium">{l.label}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      {[
                        { id: "meals",      color: "var(--green-primary)" },
                        { id: "waste",      color: "#f87171" },
                        { id: "deliveries", color: "#3b82f6" },
                      ].map((g) => (
                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={g.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={g.color} stopOpacity={0}   />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="meals"      stroke="var(--green-primary)" strokeWidth={2.5} fill="url(#meals)"      dot={{ r: 3, fill: "var(--green-primary)", strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="waste"      stroke="#f87171"              strokeWidth={2.5} fill="url(#waste)"      dot={{ r: 3, fill: "#f87171",              strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="deliveries" stroke="#3b82f6"              strokeWidth={2.5} fill="url(#deliveries)" dot={{ r: 3, fill: "#3b82f6",              strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Role breakdown */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[var(--green-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-color)]">Users by Role</h3>
                    <p className="text-[11px] text-[var(--muted-text)]">251 total registered</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {roleUsers.map((r, i) => {
                    const Icon = r.icon;
                    const pct = Math.round((r.count / 251) * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${r.color} flex items-center justify-center`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-color)]">{r.role}</span>
                          </div>
                          <span className="text-xs font-black text-[var(--text-color)]">{r.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-color-light)] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-[var(--green-primary)] to-emerald-400" />
                        </div>
                        <p className="text-[10px] text-[var(--green-primary)] font-semibold mt-1">{r.change}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Activity feed + alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Live activity */}
              <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[var(--green-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-color)]">Live Activity Feed</h3>
                      <p className="text-[11px] text-[var(--muted-text)]">Real-time platform events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-xl px-2.5 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-700">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((item, i) => {
                    const cfg = activityTypeConfig[item.type];
                    const sCfg = statusConfig[item.status];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[var(--bg-color-light)] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--text-color)] truncate">{item.name}</p>
                            <p className="text-[11px] text-[var(--muted-text)] truncate">{item.action}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sCfg.bg}`}>{sCfg.label}</span>
                          <span className="text-[10px] text-[var(--muted-text)] whitespace-nowrap">{item.time}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* System alerts */}
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-color)]">System Alerts</h3>
                    <p className="text-[11px] text-[var(--muted-text)]">Needs attention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { level: "critical", msg: "3 food items expiring in 30 min",    icon: Clock,        color: "bg-red-50 border-red-200 text-red-700"    },
                    { level: "warning",  msg: "Robin #4 has no active route",        icon: Truck,        color: "bg-orange-50 border-orange-200 text-orange-700" },
                    { level: "info",     msg: "2 new hotel registrations pending",   icon: Building2,    color: "bg-blue-50 border-blue-200 text-blue-700" },
                    { level: "success",  msg: "AI model accuracy at 94.2%",          icon: CheckCircle2, color: "bg-green-50 border-green-200 text-green-700" },
                  ].map((alert, i) => {
                    const Icon = alert.icon;
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${alert.color}`}>
                        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold leading-snug">{alert.msg}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Quick stats */}
                <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.05)] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">Today at a Glance</p>
                  {[
                    { label: "Food listed",    value: "47 items" },
                    { label: "Deliveries done",value: "31"       },
                    { label: "Waste avoided",  value: "89 kg"    },
                    { label: "Revenue saved",  value: "₹12,400"  },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted-text)]">{s.label}</span>
                      <span className="font-bold text-[var(--text-color)]">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
