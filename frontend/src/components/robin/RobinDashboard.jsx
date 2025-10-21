import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  DollarSign,
  Star,
  Target,
  Menu,
  Award,
  BarChart3,
  Activity,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/robin/Sidebar";
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
import { Progress } from "@/components/ui/progress";
import SelectRoute from "@/components/robin/SelectRoute";
import ActiveDelivery from "@/components/robin/ActiveDelivery";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";

export default function RobinDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const todayStats = {
    deliveries: 12,
    earnings: 340,
    rating: 4.9,
    efficiency: 92,
  };

  const robinProfile = {
    badges: ["Star Performer", "Eco Hero", "100 Deliveries"],
  };

  const analyticsData = [
    { day: "Mon", delivered: 10, earnings: 280 },
    { day: "Tue", delivered: 8, earnings: 240 },
    { day: "Wed", delivered: 12, earnings: 310 },
    { day: "Thu", delivered: 14, earnings: 350 },
    { day: "Fri", delivered: 11, earnings: 300 },
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
            <h1 className="text-2xl font-semibold tracking-tight">
              {activePage === "dashboard"
                ? "Robin Dashboard"
                : activePage === "selectRoute"
                ? "Select Route"
                : activePage === "activeDelivery"
                ? " Active Delivery"
                : "Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-[var(--green-primary)] hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">
                  <AvatarImage src="/worker-avatar.png" alt="Worker" />
                  <AvatarFallback>R</AvatarFallback>
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

        {/* Dashboard Content */}

        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === "dashboard" && (
            <>
              {/* Today's Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    title: "Deliveries Completed",
                    value: todayStats.deliveries,
                    icon: Truck,
                    color: "#3b82f6",
                  }, // blue
                  {
                    title: "Earnings Today",
                    value: `₹${todayStats.earnings}`,
                    icon: DollarSign,
                    color: "#16a34a",
                  }, // green
                  {
                    title: "Average Rating",
                    value: todayStats.rating,
                    icon: Star,
                    color: "#eab308",
                  }, // yellow
                  {
                    title: "Efficiency",
                    value: `${todayStats.efficiency}%`,
                    icon: Target,
                    color: "#8b5cf6",
                  }, // purple
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-5 rounded-2xl bg-[var(--card-bg)] shadow-none border border-[var(--border)]">
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

              {/* Performance Chart */}
              <Card className="p-6 bg-[var(--bg-color)] rounded-2xl shadow-none mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="text-[var(--green-primary)]" /> Weekly
                  Delivery Overview
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
                      wrapperStyle={{ outline: "none" }} // remove default border
                      contentStyle={{
                        backgroundColor: "var(--card-bg)", // match card background
                        border: "1px solid var(--border)",
                        color: "var(--text-color)",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                      itemStyle={{
                        color: "var(--green-primary)", // match text color
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#3b82f6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#16a34a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Performance Metrics */}
              <Card className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-none mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="text-[var(--green-primary)]" />{" "}
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Delivery Success Rate",
                      value: 98,
                      color: "#16a34a",
                    }, // green
                    { label: "On-Time Delivery", value: 94, color: "#3b82f6" }, // blue
                    { label: "Community Impact", value: 96, color: "#8b5cf6" }, // purple
                  ].map((metric, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <Progress
                        value={metric.value}
                        className="h-2"
                        style={{
                          backgroundColor: `${metric.color}30`,
                        }}
                      >
                        <div
                          className="h-2 rounded"
                          style={{
                            width: `${metric.value}%`,
                            backgroundColor: metric.color,
                          }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Badges Section */}
              <Card className="p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-none">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="text-[#eab308]" /> Achievements & Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {robinProfile.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-[var(--bg-color)] rounded-xl shadow hover:shadow-md transition"
                    >
                      <Award className="w-8 h-8 text-[#eab308] mx-auto mb-2" />
                      <div className="font-medium text-sm text-[var(--text-color)]">
                        {badge}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activePage === "selectRoute" && <SelectRoute />}
          {activePage === "activeDelivery" && <ActiveDelivery />}
          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
