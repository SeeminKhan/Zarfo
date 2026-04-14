import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/worker/Sidebar";
import {
  Search, Leaf, Menu, User, LogOut, Bell,
  Flame, Candy, Zap, Tag, Package, Heart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "react-toastify";
import NotificationBell from "@/components/NotificationBell";
import FoodCard from "@/components/worker/FoodCard";
import MyRequests from "@/components/worker/MyRequests";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";

const filters = [
  { value: "all",     label: "All",     icon: null    },
  { value: "veg",     label: "Veg",     icon: Leaf    },
  { value: "non-veg", label: "Non-Veg", icon: Flame   },
  { value: "sweet",   label: "Sweet",   icon: Candy   },
  { value: "spicy",   label: "Spicy",   icon: Zap     },
];

const pageTitles = {
  feed:       "Browse Meals",
  myRequests: "My Requests",
  profile:    "My Profile",
};

export default function WorkerDashboard() {
  const [listings, setListings]             = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeLeft, setTimeLeft]             = useState({});
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [activePage, setActivePage]         = useState("feed");
  const [loading, setLoading]               = useState(false);
  const { logout, user }                    = useAuth();
  const navigate                            = useNavigate();

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const handleLogout  = async () => { await logout(); navigate("/login"); };

  const fetchFood = async () => {
    try {
      setLoading(true);
      const res = await api.get("/worker/browse", {
        params: selectedFilter !== "all" ? { category: selectedFilter } : {},
      });
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch donation food:", err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFood(); }, [selectedFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes = {};
      listings.forEach((item) => {
        const diff = new Date(item.expiryTime) - new Date();
        if (diff > 0) {
          const hours   = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimes[item._id] = `${hours}h ${minutes}m`;
        } else {
          newTimes[item._id] = "Expired";
        }
      });
      setTimeLeft(newTimes);
    }, 60000);
    return () => clearInterval(interval);
  }, [listings]);

  const requestFood = async (item) => {
    try {
      console.log(`[WorkerDashboard] Requesting food: ${item._id} (${item.title})`);
      await api.post("/worker/order/create", { foodId: item._id });
      toast.success("Food requested! A robin will deliver it to you.");
      fetchFood();
    } catch (err) {
      console.error("[WorkerDashboard] requestFood error:", err.message);
      toast.error(err.response?.data?.message || err.message || "Failed to request");
    }
  };

  const filteredListings = listings.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="flex justify-between items-center px-4 sm:px-6 py-3 sticky top-0 z-20 bg-[var(--card-bg)] border-b border-[rgba(0,0,0,0.06)] shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}
              className="rounded-xl text-[var(--text-color)] hover:bg-[var(--bg-color-light)] w-9 h-9">
              <Menu size={18} />
            </Button>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-none">{pageTitles[activePage]}</h1>
              <p className="text-[10px] text-[var(--muted-text)] mt-0.5 hidden sm:block font-medium">Zarfo Worker Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--bg-color-light)] transition-colors border border-transparent hover:border-[rgba(0,0,0,0.06)]">
                  <Avatar className="w-8 h-8 ring-2 ring-[var(--green-primary)]/30 ring-offset-1">
                    <AvatarImage src="/worker-avatar.png" alt="Worker" />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || "W"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-none max-w-[90px] truncate">{user?.name || "Worker"}</p>
                    <p className="text-[10px] text-[var(--muted-text)] mt-0.5">Night Worker</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.08)] shadow-2xl rounded-2xl w-52 py-1.5">
                <div className="px-3 py-2.5 border-b border-[rgba(0,0,0,0.06)]">
                  <p className="text-sm font-bold truncate">{user?.name || "Worker"}</p>
                  <p className="text-[11px] text-[var(--muted-text)] truncate mt-0.5">{user?.email || ""}</p>
                </div>
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--bg-color-light)] rounded-xl mx-1.5 mt-1"
                  onClick={() => setActivePage("profile")}>
                  <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                  </div>Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[rgba(0,0,0,0.06)]" />
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-50 rounded-xl mx-1.5 mb-1"
                  onClick={handleLogout}>
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">

            {activePage === "feed" && (
              <motion.div key="feed"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="space-y-5 max-w-7xl mx-auto"
              >
                {/* Hero banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] p-5 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-6 w-48 h-48 rounded-full bg-white/5" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Free Meals Available</p>
                      <h2 className="text-lg sm:text-xl font-bold leading-tight">Good evening, {user?.name?.split(" ")[0] || "Worker"}</h2>
                      <p className="text-white/70 text-xs mt-1.5 max-w-xs leading-relaxed">
                        {listings.length} free meal{listings.length !== 1 ? "s" : ""} available from nearby hotels tonight.
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Search + filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
                    <input type="text" placeholder="Search meals..."
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[rgba(0,0,0,0.08)] bg-[var(--card-bg)] text-[var(--text-color)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]/30 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                    {filters.map((f) => {
                      const Icon = f.icon;
                      const active = selectedFilter === f.value;
                      return (
                        <button key={f.value} onClick={() => setSelectedFilter(f.value)}
                          className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
                            active
                              ? "bg-[var(--green-primary)] text-white shadow-sm"
                              : "bg-[var(--card-bg)] text-[var(--muted-text)] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)]"
                          }`}
                        >
                          {Icon && <Icon className="w-3.5 h-3.5" />}{f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!loading && (
                  <p className="text-xs text-[var(--muted-text)] font-medium">
                    {filteredListings.length} meal{filteredListings.length !== 1 ? "s" : ""} available
                  </p>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-[var(--green-primary)] animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-color)]">Finding available meals...</p>
                  </div>
                ) : filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredListings.map((item, i) => (
                      <motion.div key={item._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}>
                        <FoodCard item={item} timeLeft={timeLeft} onRequest={requestFood} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-color-light)] flex items-center justify-center">
                      <Package className="w-8 h-8 opacity-30" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[var(--text-color)]">No meals available</p>
                      <p className="text-xs mt-1">Check back later or adjust your filter.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activePage === "myRequests" && (
              <motion.div key="myRequests"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto">
                <MyRequests />
              </motion.div>
            )}

            {activePage === "profile" && (
              <motion.div key="profile"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto">
                <ProfilePage />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
