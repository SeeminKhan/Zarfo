import { useState, useEffect } from "react";
import {
  CheckCircle2, Package, User, Clock, Truck,
  Loader2, ClipboardList, Star, IndianRupee, Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

const STATUS_CONFIG = {
  delivered: { label: "Delivered", bg: "bg-green-100 text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-100 text-red-600",    dot: "bg-red-400"   },
};

export default function PastDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/delivery/robin/history");
        setDeliveries(Array.isArray(data) ? data : []);
        console.log("[PastDeliveries] Loaded:", data.length);
      } catch (err) {
        console.error("[PastDeliveries] Failed:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--green-primary)] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-color)]">Loading delivery history...</p>
      </div>
    );
  }

  if (!deliveries.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <ClipboardList className="w-10 h-10 text-[var(--green-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-[var(--text-color)]">No past deliveries</p>
          <p className="text-sm mt-1">Completed deliveries will appear here.</p>
        </div>
      </div>
    );
  }

  // Summary stats
  const totalMeals    = deliveries.reduce((s, d) => s + (d.mealsServed || 0), 0);
  const totalDistance = deliveries.reduce((s, d) => s + (d.totalDistance || 0), 0).toFixed(1);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Deliveries", value: deliveries.length, icon: Truck,        color: "text-blue-500 bg-blue-50"   },
          { label: "Meals Served",     value: totalMeals,        icon: Heart,        color: "text-pink-500 bg-pink-50"   },
          { label: "km Covered",       value: totalDistance,     icon: CheckCircle2, color: "text-[var(--green-primary)] bg-green-50" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.05)] p-4 text-center">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-[var(--text-color)]">{s.value}</p>
              <p className="text-[11px] text-[var(--muted-text)] mt-0.5 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Delivery list */}
      <div className="space-y-3">
        {deliveries.map((d, idx) => {
          const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.delivered;
          return (
            <motion.div key={d._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] bg-green-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--green-primary)]/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--green-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-color)]">{d.foodName}</p>
                    <p className="text-[11px] text-[var(--muted-text)] mt-0.5 capitalize">
                      {d.foodCategory} &bull; {d.mealsServed} recipient{d.mealsServed !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${cfg.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                    <Truck className="w-3 h-3" />
                  </div>
                  <span>{d.totalDistance ?? "—"} km</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span>
                    {d.deliveredAt
                      ? new Date(d.deliveredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <span>{(d.recipients || []).map(r => r.name).join(", ") || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                    <Star className="w-3 h-3" />
                  </div>
                  <span>{new Date(d.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
