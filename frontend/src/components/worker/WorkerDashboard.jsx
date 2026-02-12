import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar } from "@/components/worker/Sidebar";
import { Search, Leaf, Menu, Star, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FoodCard from "@/components/worker/FoodCard";
import MyRequests from "@/components/worker/MyRequests";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";

export default function WorderDashboard() {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeLeft, setTimeLeft] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("feed");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  // Fetch food
  const fetchFood = async () => {
    try {
      const res = await api.get("/worker/browse", {
        params: selectedFilter !== "all" ? { category: selectedFilter } : {},
      });
      setListings(Array.isArray(res.data) ? res.data : []);
      console.log("Fetched food listings:", res.data);
    } catch (err) {
      console.error("Failed to fetch donation food:", err);
      setListings([]);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [selectedFilter]);

  // Timer calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes = {};
      listings.forEach((item) => {
        const diff = new Date(item.expiryTime) - new Date();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimes[item._id] = `${hours}h ${minutes}m`;
        } else newTimes[item._id] = "Expired";
      });
      setTimeLeft(newTimes);
    }, 60000);
    return () => clearInterval(interval);
  }, [listings]);

  const requestFood = async (item) => {
    try {
      await api.post("/worker/order/create", { foodId: item._id });
      toast.success("Request sent successfully");
      fetchFood(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request");
    }
  };

  const addToCart = (item) => {
    if (!cart.find((i) => i._id === item._id)) {
      setCart((prev) => [...prev, item]);
      toast.success(`${item.title} added to cart`);
    } else {
      toast.info(`${item.title} is already in your cart`);
    }
  };

  const placeOrder = async (item) => {
    try {
      await api.post("/worker/order", { foodId: item._id });
      toast.success("Request sent successfully");
      fetchFood();
      setCart((prev) => prev.filter((i) => i._id !== item._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

      {/* Main */}
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
              {activePage === "feed"
                ? "Worker Feed"
                : activePage === "myRequests"
                  ? "My Requests"
                  : "Profile"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-[var(--green-primary)] hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">
                  <AvatarImage src="/worker-avatar.png" alt="Worker" />
                  <AvatarFallback>U</AvatarFallback>
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

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* FEED PAGE */}
          {activePage === "feed" && (
            <>
              {/* Search + Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for food, cuisine, or restaurant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "veg", "non-veg", "sweet", "spicy"].map((filter) => (
                    <Button
                      key={filter}
                      variant={
                        selectedFilter === filter ? "default" : "outline"
                      }
                      onClick={() => setSelectedFilter(filter)}
                      size="sm"
                    >
                      {filter === "veg" && (
                        <Leaf className="w-4 h-4 mr-1 text-green-600" />
                      )}
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Food Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.length > 0 ? (
                  filteredListings.map((item) => (
                    <FoodCard
                      key={item._id}
                      item={item}
                      timeLeft={timeLeft}
                      onRequest={requestFood}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-12">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No food found. Try adjusting filters.
                  </div>
                )}
              </div>
            </>
          )}

          {activePage === "myRequests" && <MyRequests />}
        </main>
      </div>
    </div>
  );
}
