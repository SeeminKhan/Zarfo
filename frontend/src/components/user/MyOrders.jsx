import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Clock, CheckCircle2, Package, Navigation, Phone, Loader2, ClipboardList, IndianRupee, Star } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "pending_pickup":
    case "pending":
      return { label: "Pending Pickup", bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", pulse: true };
    case "in_transit":
      return { label: "In Transit",     bg: "bg-blue-100 text-blue-700",     dot: "bg-blue-500",   pulse: true };
    case "delivered":
      return { label: "Delivered",      bg: "bg-green-100 text-green-700",   dot: "bg-green-500",  pulse: false };
    default:
      return { label: status || "Unknown", bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400",   pulse: false };
  }
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "Delivered");
  const pastOrders   = orders.filter((o) => o.status === "delivered" || o.status === "Delivered");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--green-primary)] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-color)]">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <ClipboardList className="w-10 h-10 text-[var(--green-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-[var(--text-color)]">No orders yet</p>
          <p className="text-sm mt-1">Your order history will appear here.</p>
        </div>
      </div>
    );
  }

  const OrderCard = ({ order, idx, isPast }) => {
    const statusCfg = getStatusConfig(order.status);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05, duration: 0.2 }}
        className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden hover:shadow-md transition-all duration-200"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] ${isPast ? "bg-[var(--bg-color-light)]/50" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPast ? "bg-green-50" : "bg-blue-50"}`}>
              {isPast
                ? <CheckCircle2 className="w-5 h-5 text-[var(--green-primary)]" />
                : <Package className="w-5 h-5 text-blue-500" />
              }
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-color)]">
                {order.foodName || `Order #${order._id?.slice(-6)}`}
              </p>
              <p className="text-[11px] text-[var(--muted-text)] mt-0.5">
                {order.hotelName || "Zarfo Partner"} &bull; {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${statusCfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${statusCfg.pulse ? "animate-pulse" : ""}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {order.driver && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span>{order.driver}</span>
              </div>
            )}
            {order.eta && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span>ETA: {order.eta} mins</span>
              </div>
            )}
            {order.price != null && (
              <div className="flex items-center gap-1 text-xs font-bold text-[var(--green-primary)]">
                <IndianRupee className="w-3 h-3" />{order.price}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isPast ? (
              <>
                <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[rgba(0,0,0,0.1)] hover:bg-[var(--bg-color-light)] gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Track
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[rgba(0,0,0,0.1)] hover:bg-[var(--bg-color-light)] gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[rgba(0,0,0,0.1)] hover:bg-[var(--bg-color-light)] gap-1.5">
                <Star className="w-3.5 h-3.5" /> Rate
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-[var(--text-color)]">Active Orders</h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{activeOrders.length}</span>
          </div>
          {activeOrders.map((order, i) => <OrderCard key={order._id} order={order} idx={i} isPast={false} />)}
        </div>
      )}

      {pastOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[var(--green-primary)]" />
            <h3 className="text-sm font-bold text-[var(--text-color)]">Past Orders</h3>
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{pastOrders.length}</span>
          </div>
          {pastOrders.map((order, i) => <OrderCard key={order._id} order={order} idx={i} isPast={true} />)}
        </div>
      )}
    </div>
  );
}
