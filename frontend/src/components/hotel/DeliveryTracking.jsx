import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, Star, IndianRupee, Truck, Package,
  User, CheckCircle2, Navigation, Phone, Loader2,
  Heart, RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
  assigned:  { label: "Robin Assigned",  bg: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",   pulse: true  },
  picked_up: { label: "Picked Up",       bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500", pulse: true  },
  delivered: { label: "Delivered",       bg: "bg-green-100 text-green-700",  dot: "bg-green-500",  pulse: false },
  cancelled: { label: "Cancelled",       bg: "bg-red-100 text-red-600",      dot: "bg-red-400",    pulse: false },
};

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/delivery/hotel");
      console.log("[DeliveryTracking] Fetched deliveries:", data.length);
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[DeliveryTracking] Failed to fetch:", err.message);
      toast.error("Failed to load delivery data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  // Auto-refresh every 30s when deliveries are in progress
  useEffect(() => {
    const hasActive = deliveries.some((d) => d.status !== "delivered" && d.status !== "cancelled");
    if (!hasActive) return;
    const interval = setInterval(fetchDeliveries, 30000);
    return () => clearInterval(interval);
  }, [deliveries]);

  const inTransit = deliveries.filter((d) => d.status !== "delivered" && d.status !== "cancelled");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--green-primary)] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-color)]">Loading deliveries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-color)]">Delivery Tracking</h2>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">Real-time status of your food deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          {inTransit.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700">{inTransit.length} in progress</span>
            </div>
          )}
          <button onClick={fetchDeliveries}
            className="flex items-center gap-1.5 text-xs text-[var(--green-primary)] font-semibold hover:bg-[var(--green-primary)]/10 px-3 py-2 rounded-xl transition-colors border border-[var(--green-primary)]/20">
            <RefreshCw className="w-3.5 h-3.5" /><span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {deliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-[var(--muted-text)]">
          <div className="w-20 h-20 rounded-3xl bg-[var(--bg-color-light)] flex items-center justify-center">
            <Truck className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-color)]">No deliveries yet</p>
            <p className="text-xs mt-1">Deliveries will appear here once a robin accepts a route for your food.</p>
          </div>
        </div>
      )}

      {/* Delivery cards */}
      <div className="space-y-4">
        {deliveries.map((delivery, idx) => {
          const statusCfg = STATUS_CONFIG[delivery.status] ?? STATUS_CONFIG.assigned;
          return (
            <motion.div key={delivery._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.25 }}
              className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.06)] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] bg-[var(--bg-color-light)]/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--green-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-color)]">{delivery.foodName}</p>
                    <p className="text-[11px] text-[var(--muted-text)] mt-0.5 capitalize">
                      {delivery.foodCategory} &bull; Qty: {delivery.quantity} &bull; {delivery.mealsServed} recipient{delivery.mealsServed !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${statusCfg.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${statusCfg.pulse ? "animate-pulse" : ""}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Progress bar */}
              {delivery.status !== "delivered" && delivery.status !== "cancelled" && (
                <div className="px-5 pt-3">
                  <div className="flex justify-between text-[10px] text-[var(--muted-text)] mb-1.5">
                    <span>Assigned</span><span>Picked Up</span><span>Delivered</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-color-light)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r from-[var(--green-primary)] to-emerald-400 transition-all duration-500 ${
                      delivery.status === "picked_up" ? "w-2/3" : "w-1/3"
                    }`} />
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Robin info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Robin</h5>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-color-light)] rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-color)]">{delivery.robinName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-[var(--muted-text)]">Night Robin</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Recipients</h5>
                  </div>
                  <div className="space-y-1.5">
                    {(delivery.recipients || []).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[var(--bg-color-light)] rounded-xl px-3 py-2">
                        <User className="w-3 h-3 text-[var(--muted-text)]" />
                        <span className="text-xs text-[var(--text-color)] font-medium truncate">{r.name}</span>
                      </div>
                    ))}
                    {(delivery.recipients || []).length === 0 && (
                      <p className="text-xs text-[var(--muted-text)]">No recipients assigned</p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Timeline</h5>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--muted-text)]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3 h-3" />
                      </div>
                      <span>Assigned: {new Date(delivery.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {delivery.pickedUpAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-3 h-3 text-orange-500" />
                        </div>
                        <span>Picked up: {new Date(delivery.pickedUpAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                    {delivery.deliveredAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[var(--green-primary)]" />
                        </div>
                        <span className="font-semibold text-[var(--green-primary)]">
                          Delivered: {new Date(delivery.deliveredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    {delivery.expiryTime && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3 h-3 text-red-400" />
                        </div>
                        <span>Expires: {new Date(delivery.expiryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
