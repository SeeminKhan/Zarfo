import { useEffect, useState } from "react";
import {
  Loader2, IndianRupee, Leaf, Flame, Package,
  Calendar, Tag, Sparkles, RefreshCw, Search,
  Filter, Clock, Candy, Zap, CheckCircle2, XCircle,
  ShoppingBag, Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function FoodListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  async function fetchListings() {
    try {
      setLoading(true);
      const { data } = await api.get("/hotel/food/my-listings");
      setListings(Array.isArray(data) ? data : data?.food || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  const getCategoryConfig = (category) => {
    switch (category?.toLowerCase()) {
      case "veg":
        return { bg: "bg-green-100 text-green-700 border-green-200", icon: <Leaf className="w-3 h-3" />, dot: "bg-green-500" };
      case "non-veg":
        return { bg: "bg-red-100 text-red-700 border-red-200", icon: <Flame className="w-3 h-3" />, dot: "bg-red-500" };
      case "sweet":
        return { bg: "bg-pink-100 text-pink-700 border-pink-200", icon: <Candy className="w-3 h-3" />, dot: "bg-pink-500" };
      case "spicy":
        return { bg: "bg-orange-100 text-orange-700 border-orange-200", icon: <Zap className="w-3 h-3" />, dot: "bg-orange-500" };
      default:
        return { bg: "bg-gray-100 text-gray-600 border-gray-200", icon: <Tag className="w-3 h-3" />, dot: "bg-gray-400" };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "listed_for_sale":
        return { bg: "bg-blue-100 text-blue-700", icon: <ShoppingBag className="w-3 h-3" />, label: "For Sale" };
      case "listed_for_donation":
        return { bg: "bg-emerald-100 text-emerald-700", icon: <Heart className="w-3 h-3" />, label: "Donation" };
      case "sold":
        return { bg: "bg-gray-100 text-gray-500", icon: <CheckCircle2 className="w-3 h-3" />, label: "Sold" };
      case "donated":
        return { bg: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" />, label: "Donated" };
      case "wasted":
        return { bg: "bg-red-100 text-red-600", icon: <XCircle className="w-3 h-3" />, label: "Wasted" };
      default:
        return { bg: "bg-gray-100 text-gray-600", icon: null, label: status?.replace(/_/g, " ") || "N/A" };
    }
  };

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "listed_for_sale", label: "For Sale" },
    { value: "listed_for_donation", label: "Donation" },
    { value: "sold", label: "Sold" },
    { value: "donated", label: "Donated" },
  ];

  const filtered = listings.filter((l) => {
    const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Loader2 className="animate-spin h-7 w-7 text-[var(--green-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--text-color)]">Loading listings</p>
          <p className="text-xs mt-1">Fetching your food inventory...</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Package className="w-10 h-10 text-[var(--green-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-[var(--text-color)]">No food listings yet</p>
          <p className="text-sm mt-1">Add your first listing to get started on Zarfo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-color)]">Your Listings</h2>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            {listings.length} item{listings.length !== 1 ? "s" : ""} total
            {filtered.length !== listings.length && ` · ${filtered.length} shown`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-text)]" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-3 py-2 text-xs rounded-xl border border-[rgba(0,0,0,0.08)] bg-[var(--card-bg)] text-[var(--text-color)] placeholder:text-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-[var(--green-primary)]/30 transition-all"
            />
          </div>
          <button
            onClick={fetchListings}
            className="flex items-center gap-1.5 text-xs text-[var(--green-primary)] font-semibold hover:bg-[var(--green-primary)]/10 px-3 py-2 rounded-xl transition-colors border border-[var(--green-primary)]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
              filterStatus === f.value
                ? "bg-[var(--green-primary)] text-white shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted-text)] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((listing, idx) => {
            const cat = getCategoryConfig(listing.category);
            const statusCfg = getStatusConfig(listing.status);
            return (
              <motion.div
                key={listing._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                className="flex gap-4 bg-[var(--card-bg)] border border-[rgba(0,0,0,0.06)] rounded-2xl p-4 hover:shadow-md hover:border-[rgba(0,0,0,0.1)] transition-all duration-200 group"
              >
                {/* Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                  {listing.photo ? (
                    <img
                      src={`data:image/png;base64,${listing.photo}`}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-[var(--muted-text)] opacity-40" />
                  )}
                  <span className={`absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-bold border ${cat.bg}`}>
                    {cat.icon}
                    {listing.category || "Other"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[var(--text-color)] leading-tight">{listing.name}</h3>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.bg}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  {listing.description && (
                    <p className="text-[11px] text-[var(--muted-text)] line-clamp-1 leading-relaxed mb-2">{listing.description}</p>
                  )}

                  {/* Price row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    {listing.aiSuggestedPrice != null && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--green-primary)] bg-[var(--green-primary)]/10 px-2 py-0.5 rounded-lg border border-[var(--green-primary)]/15">
                        <Sparkles className="w-2.5 h-2.5" />
                        Smart
                        <IndianRupee className="w-2.5 h-2.5" />
                        {listing.aiSuggestedPrice}
                      </div>
                    )}
                    <div className="flex items-center gap-0.5 text-[10px] font-semibold text-[var(--muted-text)] bg-[var(--bg-color-light)] px-2 py-0.5 rounded-lg">
                      <IndianRupee className="w-2.5 h-2.5" />
                      {listing.sellingPrice ?? 0}
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-color-light)] rounded-lg text-[10px] font-medium text-[var(--text-color)]">
                      <Package className="w-2.5 h-2.5 text-[var(--muted-text)]" />
                      Qty: {listing.quantity}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-color-light)] rounded-lg text-[10px] font-medium text-[var(--text-color)]">
                      <Clock className="w-2.5 h-2.5 text-[var(--muted-text)]" />
                      {new Date(listing.prepTime).toLocaleDateString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-lg text-[10px] font-medium text-red-500">
                      <Calendar className="w-2.5 h-2.5" />
                      Exp: {new Date(listing.expiryTime).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--muted-text)]">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-color-light)] flex items-center justify-center">
            <Filter className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-color)]">No results found</p>
            <p className="text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        </div>
      )}
    </div>
  );
}
