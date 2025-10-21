import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/hotel/Sidebar";
import { Card } from "@/components/ui/card";
import { Menu, Plus, Package, Truck, BarChart3, Activity, Star, Briefcase } from "lucide-react";
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
  { name: "Veg Pulao", qty: "3 kg", status: "Listed", expiry: "2:00 AM" },
  {
    name: "Paneer Tikka",
    qty: "2.5 kg",
    status: "Picked Up",
    expiry: "11:30 PM",
  },
  { name: "Mixed Salad", qty: "1.2 kg", status: "Listed", expiry: "1:00 AM" },
];

const statColors = [
  {
    text: "text-[var(--green-primary)]",
    icon: "text-orange-500",
    bgIcon: "bg-orange-100",
  },
  {
    text: "text-[var(--green-primary)]",
    icon: "text-blue-500",
    bgIcon: "bg-blue-100",
  },
  {
    text: "text-[var(--green-primary)]",
    icon: "text-purple-500",
    bgIcon: "bg-purple-100",
  },
  {
    text: "text-[var(--green-primary)]",
    icon: "text-green-500",
    bgIcon: "bg-green-100",
  },
];

export default function HotelDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    if (activePage === "addFood") {
      setAddModalOpen(true);
    } else {
      setAddModalOpen(false);
    }
  }, [activePage]);
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
              openAddModal={setAddModalOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
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
                ? "Hotel Dashboard"
                : activePage === "foodListings"
                ? "Food Listings"
                : activePage === "deliveryTracking"
                ? "Delivery Tracking"
                : activePage === "addFood"
                ? "Add Food"
                : "Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-[var(--green-primary)] hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">
                  <AvatarImage src="/worker-avatar.png" alt="Worker" />
                  <AvatarFallback>H</AvatarFallback>
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

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === "dashboard" && (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: "Foods Listed Today", value: "12", icon: Package },
                  {
                    title: "Total Reused (Month)",
                    value: "96 kg",
                    icon: Truck,
                  },
                  { title: "Pending Pickups", value: "4", icon: Activity },
                  { title: "CSR Impact Score", value: "87%", icon: BarChart3 },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-5 rounded-2xl bg-[var(--card-bg)] shadow-none">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted-text)]">
                            {stat.title}
                          </p>
                          <h2
                            className={`text-3xl font-semibold mt-2 ${statColors[i].text}`}
                          >
                            {stat.value}
                          </h2>
                        </div>
                        <div
                          className={`p-3 rounded-full ${statColors[i].bgIcon}`}
                        >
                          <stat.icon
                            className={`w-6 h-6 ${statColors[i].icon}`}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Chart Section */}
              <Card className="p-6 bg-[var(--bg-color)] rounded-2xl shadow-none mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="text-[var(--green-primary)]" /> Weekly
                  Food Flow
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
                      dataKey="listed"
                      stroke="var(--green-primary)"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="picked"
                      stroke="var(--green-dark)"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Recent Listings */}
              <Card className="p-6 bg-[var(--bg-color)] rounded-2xl shadow-none">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="text-[var(--green-primary)]" /> Recent
                  Food Listings
                </h3>
                <div className="divide-y divide-[rgba(0,0,0,0.05)]">
                  {recentListings.map((item, i) => (
                    <div
                      key={i}
                      className="py-3 flex justify-between items-center hover:bg-[var(--green-primary)]/5 rounded-xl px-3 transition"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[var(--muted-text)]">
                          Qty: {item.qty} • Exp: {item.expiry}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          item.status === "Picked Up"
                            ? "bg-[var(--green-primary)]/10 text-[var(--green-primary)]"
                            : "bg-[var(--green-primary)]/5 text-[var(--green-primary)]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Floating Add Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8"
              >
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-full w-14 h-14 flex items-center justify-center 
                    bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white shadow-lg shadow-[var(--green-primary)]/40"
                >
                  <Plus size={22} />
                </Button>
              </motion.div>
            </>
          )}

          {activePage === "foodListings" && <FoodListings />}
          {activePage === "deliveryTracking" && <DeliveryTracking />}
          {activePage === "profile" && <ProfilePage />}
        </main>
      </div>

      {/* Add Food Modal (still available for quick add) */}
      <AddFoodModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
