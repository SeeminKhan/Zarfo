
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/hotel/Sidebar";
import { Card } from "@/components/ui/card";
import {
  Menu, Plus, Package, Truck, BarChart3,
  User, LogOut, TrendingUp, Clock, CheckCircle2, Leaf,
  ChefHat, ArrowUpRight, Bell, Utensils,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import AddFoodModal from "@/components/hotel/AddFood";
import FoodListings from "@/components/hotel/FoodListings";
import DeliveryTracking from "@/components/hotel/DeliveryTracking";
import { useAuth } from "@/context/AuthContext";
import ProfilePage from "@/pages/ProfilePage";

const analyticsData = [
  { day: "Mon", listed: 12, picked: 8 },
  { day: "Tue", listed: 15, picked: 10 },
  { day: "Wed", listed: 9, picked: 6 },
  { day: "Thu", listed: 18, picked: 15 },
  { day: "Fri", listed: 14, picked: 12 },
];

const recentListings = [
  { name: "Veg Pulao", qty: "3 kg", status: "Listed", expiry: "2:00 AM", category: "veg" },
  { name: "Paneer Tikka", qty: "2.5 kg", status: "Picked Up", expiry: "11:30 PM", category: "veg" },
  { name: "Mixed Salad", qty: "1.2 kg", status: "Listed", expiry: "1:00 AM", category: "veg" },
];

const stats = [
  { title: "Foods Listed Today", value: "12", icon: Package, color: "orange", change: "+3 from yesterday" },
  { title: "Total Reused (Month)", value: "96 kg", icon: Truck, color: "blue", change: "+12 kg this week" },
  { title: "Pending Pickups", value: "4", icon: Clock, color: "purple", change: "2 due soon" },
  { title: "CSR Impact Score", value: "87%", icon: TrendingUp, color: "green", change: "+5% this month" },
];

const colorMap = {
  orange: { bg: "bg-orange-50", icon: "text-orange-500" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500"   },
  purple: { bg: "bg-purple-50", icon: "text-purple-500" },
  green:  { bg: "bg-green-50",  icon: "text-[var(--green-primary)]" },
};

const pageTitles = {
  dashboard:        "Dashboard",
  foodListings:     "Food Listings",
  deliveryTracking: "Delivery Tracking",
  addFood:          "Add Food",
  profile:          "My Profile",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
  }
  return null;
};

export default function HotelDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    if (activePage === "addFood") {
      setAddModalOpen(true);
      setActivePage("dashboard");
    }
  }, [activePage]);

  return (
    <div className="flex h-screen bg-[var(--bg-color-light)] text-[var(--text-color)] overflow-hidden">
      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={toggleSidebar}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed z-40 h-full"
            >
              <Sidebar
                open={sidebarOpen}
                onClose={toggleSidebar}
                setActivePage={setActivePage}
                openAddModal={setAddModalOpen}
                activePage={activePage}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 sticky top-0 z-20 bg-[var(--card-bg)] border-b border-[rgba(0,0,0,0.06)] shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="rounded-xl text-[var(--text-color)] hover:bg-[var(--bg-color-light)] w-9 h-9"
            >
              <Menu size={18} />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-md hidden sm:flex">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-none text-[var(--text-color)]">
                  {pageTitles[activePage] || "Dashboard"}
                </h1>
                <p className="text-[10px] text-[var(--muted-text)] mt-0.5 hidden sm:block font-medium">
                  Hotel Management Portal
                </p>
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
                    <AvatarImage src="/worker-avatar.png" alt="Hotel" />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-none max-w-[90px] truncate">{user?.name || "Hotel"}</p>
                    <p className="text-[10px] text-[var(--muted-text)] mt-0.5">Hotel Manager</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] shadow-2xl rounded-2xl w-52 py-1.5"
              >
                <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)]">
                  <p className="text-sm font-bold truncate">{user?.name || "Hotel"}</p>
                  <p className="text-[11px] text-[var(--muted-text)] truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <DropdownMenuItem
                  className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--bg-color-light)] rounded-xl mx-1.5 mt-1"
                  onClick={() => setActivePage("profile")}
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                  </div>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[rgba(0,0,0,0.06)]" />
                <DropdownMenuItem
                  className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 rounded-xl mx-1.5 mb-1"
                  onClick={handleLogout}
                >
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">

            {activePage === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 max-w-6xl mx-auto"
              >
                {/* Welcome Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] p-5 sm:p-7 text-white relative overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
                    <div className="absolute -bottom-14 -left-8 w-56 h-56 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-white/5" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wide">Welcome back</p>
                      <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                        {user?.name || "Hotel Manager"}
                      </h2>
                      <p className="text-white/70 text-xs mt-2 leading-relaxed max-w-xs">
                        You have 4 pending pickups today. Keep up the great work reducing food waste.
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => setAddModalOpen(true)}
                          className="flex items-center gap-1.5 bg-white text-[var(--green-dark)] text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Food
                        </button>
                        <button
                          onClick={() => setActivePage("foodListings")}
                          className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          View Listings
                        </button>
                      </div>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
                      <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    const c = colorMap[stat.color];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.25 }}
                        whileHover={{ y: -2 }}
                      >
                        <Card className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[rgba(0,0,0,0.05)] shadow-sm hover:shadow-md transition-all duration-200 cursor-default">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`p-2.5 rounded-xl ${c.bg}`}>
                              <Icon className={`w-4 h-4 ${c.icon}`} />
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--muted-text)] opacity-40" />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)] leading-none">
                            {stat.value}
                          </h2>
                          <p className="text-[11px] text-[var(--muted-text)] mt-1.5 leading-tight font-medium">{stat.title}</p>
                          <p className="text-[10px] text-[var(--green-primary)] font-semibold mt-1.5">{stat.change}</p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Chart + Recent Listings */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {/* Chart */}
                  <Card className="lg:col-span-3 p-5 sm:p-6 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-[var(--green-primary)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-color)]">Weekly Food Flow</h3>
                          <p className="text-[11px] text-[var(--muted-text)]">Listed vs Picked Up</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--muted-text)] bg-[var(--bg-color-light)] px-3 py-1.5 rounded-xl font-semibold">
                        This Week
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[var(--green-primary)]" />
                        <span className="text-[11px] text-[var(--muted-text)] font-medium">Listed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[var(--accent-pink-dark)]" />
                        <span className="text-[11px] text-[var(--muted-text)] font-medium">Picked Up</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorListed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--green-primary)"    stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--green-primary)"    stopOpacity={0}   />
                          </linearGradient>
                          <linearGradient id="colorPicked" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--accent-pink-dark)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--accent-pink-dark)" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                        <XAxis dataKey="day" stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--muted-text)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="listed" stroke="var(--green-primary)" strokeWidth={2.5}
                          fill="url(#colorListed)" dot={{ r: 4, fill: "var(--green-primary)", strokeWidth: 0 }} activeDot={{ r: 5.5, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="picked" stroke="var(--accent-pink-dark)" strokeWidth={2.5}
                          fill="url(#colorPicked)" dot={{ r: 4, fill: "var(--accent-pink-dark)", strokeWidth: 0 }} activeDot={{ r: 5.5, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Recent Listings */}
                  <Card className="lg:col-span-2 p-5 sm:p-6 bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-[var(--green-primary)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-color)]">Recent Listings</h3>
                          <p className="text-[11px] text-[var(--muted-text)]">Latest food entries</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActivePage("foodListings")}
                        className="flex items-center gap-1 text-xs text-[var(--green-primary)] font-bold hover:underline"
                      >
                        View all <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1 flex-1">
                      {recentListings.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-[var(--bg-color-light)] transition-colors group cursor-default">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--green-primary)]/15 transition-colors">
                              <Leaf className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-[var(--text-color)]">{item.name}</p>
                              <p className="text-[10px] text-[var(--muted-text)] mt-0.5">
                                {item.qty} &bull; Exp: {item.expiry}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 flex items-center gap-1 ${
                            item.status === "Picked Up"
                              ? "bg-[var(--green-primary)]/12 text-[var(--green-primary)]"
                              : "bg-orange-100 text-orange-600"
                          }`}>
                            {item.status === "Picked Up" && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)] grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--green-primary)] bg-[var(--green-primary)]/10 hover:bg-[var(--green-primary)]/15 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Food
                      </button>
                      <button
                        onClick={() => setActivePage("deliveryTracking")}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> Deliveries
                      </button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activePage === "foodListings" && (
              <motion.div key="foodListings"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <FoodListings />
              </motion.div>
            )}

            {activePage === "deliveryTracking" && (
              <motion.div key="deliveryTracking"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto"
              >
                <DeliveryTracking />
              </motion.div>
            )}

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

      {/* Floating Add Button */}
      <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setAddModalOpen(true)}
          className="rounded-2xl w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] hover:opacity-90 text-white shadow-xl shadow-[var(--green-primary)]/40 border-0"
        >
          <Plus size={22} />
        </Button>
      </motion.div>

      <AddFoodModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
