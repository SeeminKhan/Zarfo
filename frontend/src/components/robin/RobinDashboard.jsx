import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, IndianRupee, Star, Target, Menu, Award,
  BarChart3, Activity, User, LogOut, Bell, ChefHat,
  ArrowUpRight, Navigation, Zap, Heart, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar } from "@/components/robin/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import SelectRoute from "@/components/robin/SelectRoute";
import ActiveDelivery from "@/components/robin/ActiveDelivery";
import PastDeliveries from "@/components/robin/PastDeliveries";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";

const analyticsData = [
  { day: "Mon", delivered: 10, earnings: 280 },
  { day: "Tue", delivered: 8,  earnings: 240 },
  { day: "Wed", delivered: 12, earnings: 310 },
  { day: "Thu", delivered: 14, earnings: 350 },
  { day: "Fri", delivered: 11, earnings: 300 },
];

const badges = [
  { label: "Star Performer", icon: Star,         color: "text-yellow-500 bg-yellow-50"  },
  { label: "Eco Hero",       icon: Heart,         color: "text-green-600 bg-green-50"   },
  { label: "100 Deliveries", icon: CheckCircle2,  color: "text-blue-500 bg-blue-50"     },
];

const pageTitles = {
  dashboard:      "Dashboard",
  selectRoute:    "Optimized Routes",
  activeDelivery: "Active Delivery",
  pastDeliveries: "Past Deliveries",
  profile:        "My Profile",
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

export default function RobinDashboard() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activePage, setActivePage]     = useState("dashboard");
  const [activeRoute, setActiveRoute]   = useState(null);
  const { logout, user }                = useAuth();
  const navigate                        = useNavigate();

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const handleLogout  = async () => { await logout(); navigate("/login"); };

  const handleStartRoute = (route) => {
    console.log("[RobinDashboard] Starting active delivery with route:", route);
    setActiveRoute(route);
    setActivePage("activeDelivery");
  };

  return (
    <div className="flex h-screen bg-[var(--bg-color-light)] text-[var(--text-color)] overflow-hidden">

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={toggleSidebar}
            />
            <motion.div key="sidebar"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-40 h-full"
            >
              <Sidebar open={sidebarOpen} onClose={toggleSidebar}
                setActivePage={setActivePage} activePage={activePage} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Navbar */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 sticky top-0 z-20 bg-[var(--card-bg)] border-b border-[rgba(0,0,0,0.06)] shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}
              className="rounded-xl text-[var(--text-color)] hover:bg-[var(--bg-color-light)] w-9 h-9">
              <Menu size={18} />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-md hidden sm:flex">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-none">{pageTitles[activePage]}</h1>
                <p className="text-[10px] text-[var(--muted-text)] mt-0.5 hidden sm:block font-medium">Robin Management Portal</p>
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
                    <AvatarImage src="/worker-avatar.png" alt="Robin" />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-none max-w-[90px] truncate">{user?.name || "Robin"}</p>
                    <p className="text-[10px] text-[var(--muted-text)] mt-0.5">Night Robin</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] shadow-2xl rounded-2xl w-52 py-1.5">
                <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)]">
                  <p className="text-sm font-bold truncate">{user?.name || "Robin"}</p>
                  <p className="text-[11px] text-[var(--muted-text)] truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--bg-color-light)] rounded-xl mx-1.5 mt-1"
                  onClick={() => setActivePage("profile")}>
                  <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                  </div>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[rgba(0,0,0,0.06)]" />
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 rounded-xl mx-1.5 mb-1"
                  onClick={handleLogout}>
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ─────────────────────────────────────────── */}
            {activePage === "dashboard" && (
              <motion.div key="dashboard"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                className="space-y-5 max-w-6xl mx-auto"
              >
                {/* Welcome banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] p-5 sm:p-7 text-white relative overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
                    <div className="absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/5" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wide">Welcome back</p>
                      <h2 className="text-xl sm:text-2xl font-bold leading-tight">{user?.name || "Robin"}</h2>
                      <p className="text-white/70 text-xs mt-2 max-w-xs leading-relaxed">
                        Ready for tonight's deliveries? Check your optimized routes below.
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => setActivePage("selectRoute")}
                          className="flex items-center gap-1.5 bg-white text-[var(--green-dark)] text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors shadow-lg">
                          <Navigation className="w-3.5 h-3.5" /> View Routes
                        </button>
                        <button onClick={() => setActivePage("activeDelivery")}
                          className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                          <Truck className="w-3.5 h-3.5" /> Active Delivery
                        </button>
                      </div>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
                      <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { title: "Deliveries Today", value: "12",   icon: Truck,         color: "bg-blue-50",   icon_c: "text-blue-500",   change: "+2 from yesterday" },
                    { title: "Earnings Today",   value: "₹340", icon: IndianRupee,   color: "bg-green-50",  icon_c: "text-[var(--green-primary)]", change: "+₹40 from yesterday" },
                    { title: "Avg Rating",        value: "4.9",  icon: Star,          color: "bg-yellow-50", icon_c: "text-yellow-500",  change: "Top 5% of robins" },
                    { title: "Efficiency",        value: "92%",  icon: Target,        color: "bg-purple-50", icon_c: "text-purple-500",  change: "+3% this week" },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }} whileHover={{ y: -2 }}
                      >
                        <Card className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md transition-all cursor-default">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`p-2.5 rounded-xl ${s.color}`}>
                              <Icon className={`w-4 h-4 ${s.icon_c}`} />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted-text)] opacity-40" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)] leading-none">{s.value}</h2>
                          <p className="text-[11px] text-[var(--muted-text)] mt-1.5 font-medium">{s.title}</p>
                          <p className="text-[10px] text-[var(--green-primary)] font-semibold mt-1.5">{s.change}</p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Chart + Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <Card className="lg:col-span-3 p-5 sm:p-6 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-[var(--green-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-color)]">Weekly Overview</h3>
                        <p className="text-[11px] text-[var(--muted-text)]">Deliveries and earnings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[11px] text-[var(--muted-text)] font-medium">Deliveries</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--green-primary)]" /><span className="text-[11px] text-[var(--muted-text)] font-medium">Earnings</span></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analyticsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="delivered" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5.5, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="earnings"  stroke="var(--green-primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--green-primary)", strokeWidth: 0 }} activeDot={{ r: 5.5, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="lg:col-span-2 p-5 sm:p-6 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[var(--green-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-color)]">Performance</h3>
                        <p className="text-[11px] text-[var(--muted-text)]">Key metrics</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Delivery Success Rate", value: 98, color: "bg-[var(--green-primary)]" },
                        { label: "On-Time Delivery",      value: 94, color: "bg-blue-500"               },
                        { label: "Community Impact",      value: 96, color: "bg-purple-500"             },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-[var(--muted-text)] font-medium mb-1.5">
                            <span>{m.label}</span><span>{m.value}%</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--bg-color-light)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                              className={`h-full rounded-full ${m.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <p className="text-xs font-bold text-[var(--text-color)]">Achievements</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {badges.map((b, i) => {
                          const Icon = b.icon;
                          return (
                            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold ${b.color}`}>
                              <Icon className="w-3 h-3" />{b.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ── SELECT ROUTE ──────────────────────────────────────── */}
            {activePage === "selectRoute" && (
              <motion.div key="selectRoute"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <SelectRoute onStartRoute={handleStartRoute} />
              </motion.div>
            )}

            {/* ── ACTIVE DELIVERY ───────────────────────────────────── */}
            {activePage === "activeDelivery" && (
              <motion.div key="activeDelivery"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <ActiveDelivery route={activeRoute} />
              </motion.div>
            )}

            {/* ── PAST DELIVERIES ───────────────────────────────────── */}
            {activePage === "pastDeliveries" && (
              <motion.div key="pastDeliveries"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <PastDeliveries />
              </motion.div>
            )}

            {/* ── PROFILE ───────────────────────────────────────────── */}
            {activePage === "profile" && (
              <motion.div key="profile"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <ProfilePage />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
