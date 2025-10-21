"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Heart,
  Star,
  Clock,
  Menu,
  Award,
  BarChart3,
  Briefcase,
  Utensils,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/worker/Sidebar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import RequestFood from "@/components/worker/RequestFood";
import FoodTracking from "@/components/worker/FoodTracking";
import DeliveryHistory from "@/components/worker/DeliveryHistory";
import ProfilePage from "@/pages/ProfilePage";

export default function WorkerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Mock Data
  const worker = {
    name: "Robert Smith",
    totalMeals: 23,
    thisWeek: 4,
    avgRating: 4.7,
    rank: 12,
  };

  const analyticsData = [
    { day: "Mon", meals: 2 },
    { day: "Tue", meals: 3 },
    { day: "Wed", meals: 1 },
    { day: "Thu", meals: 4 },
    { day: "Fri", meals: 2 },
  ];

  const history = [
    {
      id: 1,
      date: "2024-01-19",
      hotel: "Ocean View",
      items: ["Pasta", "Garlic Bread"],
      rating: 5,
    },
    {
      id: 2,
      date: "2024-01-18",
      hotel: "Sunset Resort",
      items: ["Curry", "Rice"],
      rating: 4,
    },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-color-light)] text-[var(--text-color)] overflow-hidden transition-all duration-300">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25 }}
            className="fixed z-40 h-full"
          >
            <Sidebar
              open={sidebarOpen}
              onClose={toggleSidebar}
              setActivePage={setActivePage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex justify-between items-center px-6 py-4 sticky top-0 z-30 backdrop-blur-lg bg-[var(--bg-color-light)] shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-[var(--green-primary)] hover:bg-[var(--green-primary)]/10"
            >
              <Menu size={22} />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight capitalize">
              {activePage === "dashboard"
                ? "Worker Dashboard"
                : activePage === "requestFood"
                ? "Request Food"
                : activePage === "tracking"
                ? "Tracking"
                : activePage === "history"
                ? "Hostory"
                : "Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-[var(--green-primary)] hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">
                  <AvatarImage src="/worker-avatar.png" alt="Worker" />
                  <AvatarFallback>W</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[var(--card-bg)] shadow-lg rounded-lg py-2 w-48 border border-[var(--border)]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[var(--green-primary)]/10 hover:text-[var(--green-dark)] transition-colors duration-200 cursor-pointer"
                  onClick={() => setActivePage("profile")}
                >
                  <Star className="w-4 h-4 text-[var(--green-primary)]" />{" "}
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                  onClick={handleLogout}
                >
                  <Briefcase className="w-4 h-4 text-red-500" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    title: "Total Meals",
                    value: worker.totalMeals,
                    icon: Utensils,
                    color: "#16a34a",
                  },
                  {
                    title: "This Week",
                    value: worker.thisWeek,
                    icon: Clock,
                    color: "#3b82f6",
                  },
                  {
                    title: "Avg Rating",
                    value: worker.avgRating,
                    icon: Star,
                    color: "#eab308",
                  },
                  {
                    title: "Rank",
                    value: `#${worker.rank}`,
                    icon: Award,
                    color: "#8b5cf6",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-none">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-text)]">
                            {stat.title}
                          </p>
                          <h2 className="text-3xl font-semibold text-[var(--text-color)] mt-2">
                            {stat.value}
                          </h2>
                        </div>
                        <div
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <stat.icon
                            className="w-6 h-6"
                            style={{ color: stat.color }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Chart */}
              <Card className="p-6 bg-[var(--bg-color)] rounded-2xl shadow-none mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="text-[var(--green-primary)]" /> Weekly
                  Meal Stats
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis dataKey="day" stroke="var(--muted-text)" />
                    <YAxis stroke="var(--muted-text)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="meals"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#16a34a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* History Preview */}
              <Card className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-none">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="text-[var(--green-primary)]" /> Recent
                  Deliveries
                </h3>
                <div className="space-y-3">
                  {history.map((d) => (
                    <div
                      key={d.id}
                      className="flex justify-between items-center p-3 bg-[var(--bg-color)] rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{d.hotel}</p>
                        <p className="text-xs text-[var(--muted-text)]">
                          {new Date(d.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < d.rating
                                ? "text-[#eab308] fill-current"
                                : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activePage === "requestFood" && <RequestFood />}

          {activePage === "tracking" && <FoodTracking />}

          {activePage === "history" && <DeliveryHistory />}

          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
