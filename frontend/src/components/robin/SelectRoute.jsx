import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Clock, Navigation, Phone, Package, User,
  RefreshCw, Loader2, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Zap, Truck, Heart, Flame,
  ArrowRight, Star, LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-toastify";

// ── helpers ────────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  critical: { bg: "bg-red-100 text-red-700",    dot: "bg-red-500",    label: "Critical" },
  high:     { bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500", label: "High"     },
  medium:   { bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", label: "Medium"   },
  low:      { bg: "bg-green-100 text-green-700",  dot: "bg-green-500",  label: "Low"      },
  expired:  { bg: "bg-gray-100 text-gray-500",   dot: "bg-gray-400",   label: "Expired"  },
};

function ExpiryBadge({ risk }) {
  const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG.low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${risk === "critical" || risk === "high" ? "animate-pulse" : ""}`} />
      {cfg.label} Risk
    </span>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[var(--muted-text)] font-medium mb-1">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg-color-light)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function SelectRoute({ onStartRoute }) {
  const [routes, setRoutes]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [message, setMessage]         = useState(null);
  const [selectedRoute, setSelected]  = useState(null);
  const [expanded, setExpanded]       = useState(null);
  const [locating, setLocating]       = useState(false);
  const [robinInfo, setRobinInfo]     = useState(null);
  const [locationSet, setLocationSet] = useState(false);

  // ── fetch optimized routes ───────────────────────────────────────────────
  const fetchRoutes = useCallback(async () => {
    console.log("[SelectRoute] Fetching optimized routes from /api/delivery/tasks/optimized");
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data } = await api.get("/delivery/tasks/optimized");
      console.log("[SelectRoute] Response received:", data);

      setRobinInfo(data.robin ?? null);
      setRoutes(data.routes ?? []);

      if (data.message) {
        console.log("[SelectRoute] Server message:", data.message);
        setMessage(data.message);
      }

      if (data.routes?.length) {
        console.log(`[SelectRoute] ${data.routes.length} route(s) returned. Top score: ${data.routes[0]?.priorityScore}`);
      } else {
        console.warn("[SelectRoute] No routes returned.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to fetch routes";
      console.error("[SelectRoute] Error fetching routes:", msg, err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── set robin location via browser geolocation ───────────────────────────
  const setLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      console.error("[SelectRoute] Geolocation API not available.");
      return;
    }

    setLocating(true);
    console.log("[SelectRoute] Requesting browser geolocation...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log(`[SelectRoute] Got location: lat=${lat}, lng=${lng}`);

        try {
          await api.patch("/auth/location", { lat, lng });
          console.log("[SelectRoute] Location saved to backend successfully.");
          toast.success("Location updated. Fetching routes...");
          setLocationSet(true);
          fetchRoutes();
        } catch (err) {
          const msg = err.response?.data?.error || err.message || "Failed to save location";
          console.error("[SelectRoute] Failed to save location:", msg, err);
          toast.error(msg);
        } finally {
          setLocating(false);
        }
      },
      (geoErr) => {
        console.error("[SelectRoute] Geolocation error:", geoErr.message);
        toast.error(`Location error: ${geoErr.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── render ───────────────────────────────────────────────────────────────

  // ── start delivery — accept route on backend ────────────────────────────
  const startDelivery = async () => {
    if (selectedRoute === null) return;
    const route = routes[selectedRoute];
    setLoading(true);
    try {
      console.log("[SelectRoute] Accepting route on backend:", route);
      const { data } = await api.post("/delivery/tasks/accept", {
        hotelId:       route.hotelId,
        foodId:        route.hotelId, // hotelId used as proxy; service resolves foodId from food doc
        workerIds:     route.workerIds,
        routeSnapshot: route,
      });
      console.log("[SelectRoute] Route accepted, delivery created:", data.delivery?._id);
      toast.success("Delivery started!");
      if (onStartRoute) onStartRoute({ ...route, deliveryId: data.delivery._id });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to start delivery";
      console.error("[SelectRoute] acceptRoute error:", msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── navigate in Google Maps ──────────────────────────────────────────────
  const openMapsNav = (from, to) => {
    if (!from?.lat || !to?.lat) {
      toast.info("Location coordinates not available for navigation.");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
    console.log("[SelectRoute] Opening Google Maps navigation:", url);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-color)]">Optimized Routes</h2>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            AI-ranked delivery routes based on expiry, distance and demand
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={setLocation}
            disabled={locating}
            size="sm"
            variant="outline"
            className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5"
          >
            {locating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <LocateFixed className="w-3.5 h-3.5 text-blue-500" />
            }
            {locating ? "Locating..." : "Set My Location"}
          </Button>
          <Button
            onClick={fetchRoutes}
            disabled={loading}
            size="sm"
            className="h-9 text-xs rounded-xl bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white border-0 gap-1.5"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Robin location info */}
      {robinInfo?.location?.lat && (
        <div className="flex items-center gap-2 text-xs text-[var(--muted-text)] bg-[var(--card-bg)] border border-[rgba(0,0,0,0.06)] rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-[var(--green-primary)]" />
          <span>Your location: <span className="font-semibold text-[var(--text-color)]">{robinInfo.location.lat.toFixed(4)}, {robinInfo.location.lng.toFixed(4)}</span></span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[var(--green-primary)] animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-color)]">Running route optimizer...</p>
            <p className="text-xs mt-1">Scoring hotels, matching workers, building routes</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-color)]">Could not load routes</p>
            <p className="text-xs text-[var(--muted-text)] mt-1 max-w-xs">{error}</p>
            {error.includes("location") && (
              <Button onClick={setLocation} size="sm" className="mt-3 h-8 text-xs rounded-xl bg-[var(--green-primary)] text-white border-0">
                <LocateFixed className="w-3.5 h-3.5 mr-1.5" /> Set Location First
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty / message state */}
      {!loading && !error && !routes.length && (
        <div className="flex flex-col items-center justify-center h-48 gap-4 text-[var(--muted-text)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-color-light)] flex items-center justify-center">
            <Truck className="w-8 h-8 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-color)]">No routes available</p>
            <p className="text-xs mt-1">{message || "No active donation food or pending worker requests right now."}</p>
          </div>
        </div>
      )}

      {/* Route cards */}
      {!loading && !error && routes.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {routes.map((route, idx) => {
              const isSelected = selectedRoute === idx;
              const isExpanded = expanded === idx;
              const pickupStep = route.steps?.find((s) => s.type === "pickup");
              const dropSteps  = route.steps?.filter((s) => s.type === "drop") ?? [];

              return (
                <motion.div
                  key={`${route.hotelId}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.2 }}
                  className={`bg-[var(--card-bg)] rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-[var(--green-primary)] shadow-lg shadow-[var(--green-primary)]/15"
                      : "border-[rgba(0,0,0,0.06)] hover:shadow-md hover:border-[rgba(0,0,0,0.1)]"
                  }`}
                >
                  {/* Card header */}
                  <div className={`flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] ${
                    isSelected ? "bg-[var(--green-primary)]/5" : "bg-[var(--bg-color-light)]/40"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-[var(--green-primary)]" : "bg-[var(--green-primary)]/10"
                      }`}>
                        <Navigation className={`w-5 h-5 ${isSelected ? "text-white" : "text-[var(--green-primary)]"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-color)]">
                          Route {idx + 1} — {route.hotelName}
                        </p>
                        <p className="text-[11px] text-[var(--muted-text)] mt-0.5">
                          {route.mealsServed} worker{route.mealsServed !== 1 ? "s" : ""} &bull; {route.totalDistance} km &bull; ~{route.estimatedTime} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExpiryBadge risk={route.expiryRisk} />
                      <button
                        onClick={() => setExpanded(isExpanded ? null : idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-3 divide-x divide-[rgba(0,0,0,0.05)] px-0">
                    {[
                      { icon: Zap,     label: "Priority",  value: `${Math.round(route.priorityScore * 100)}%`, color: "text-violet-500" },
                      { icon: Truck,   label: "Distance",  value: `${route.totalDistance} km`,                 color: "text-blue-500"   },
                      { icon: Heart,   label: "Meals",     value: `${route.mealsServed} served`,               color: "text-pink-500"   },
                    ].map(({ icon: Icon, label, value, color }, i) => (
                      <div key={i} className="flex flex-col items-center py-3 gap-0.5">
                        <Icon className={`w-4 h-4 ${color} mb-0.5`} />
                        <p className="text-xs font-black text-[var(--text-color)]">{value}</p>
                        <p className="text-[10px] text-[var(--muted-text)]">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[rgba(0,0,0,0.05)]">

                          {/* Steps timeline */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">Route Steps</p>
                            <div className="relative pl-1">
                              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-[rgba(0,0,0,0.06)]" />
                              <div className="space-y-3">
                                {/* Pickup */}
                                {pickupStep && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-xl bg-[var(--green-primary)] flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                                      <Package className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-bold text-[var(--text-color)]">Pickup</p>
                                      <p className="text-[11px] text-[var(--muted-text)] mt-0.5 leading-snug">{pickupStep.label}</p>
                                      {pickupStep.location?.lat && (
                                        <button
                                          onClick={() => openMapsNav(robinInfo?.location, pickupStep.location)}
                                          className="flex items-center gap-1 text-[10px] text-[var(--green-primary)] font-semibold mt-1 hover:underline"
                                        >
                                          <Navigation className="w-3 h-3" /> Navigate
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Drops */}
                                {dropSteps.map((step, si) => (
                                  <div key={si} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                                      <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <p className="text-xs font-bold text-[var(--text-color)]">Drop {si + 1}</p>
                                      <p className="text-[11px] text-[var(--muted-text)] mt-0.5 leading-snug">{step.label}</p>
                                      {step.location?.lat && pickupStep?.location?.lat && (
                                        <button
                                          onClick={() => openMapsNav(pickupStep.location, step.location)}
                                          className="flex items-center gap-1 text-[10px] text-blue-500 font-semibold mt-1 hover:underline"
                                        >
                                          <Navigation className="w-3 h-3" /> Navigate
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Score breakdown */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3">Score Breakdown</p>
                            <div className="space-y-2">
                              <ScoreBar label="Expiry Urgency"  value={route.scores?.expiryScore   ?? 0} color="bg-red-400"                    />
                              <ScoreBar label="Distance"        value={route.scores?.distanceScore ?? 0} color="bg-blue-400"                   />
                              <ScoreBar label="Worker Demand"   value={route.scores?.demandScore   ?? 0} color="bg-violet-400"                 />
                              <ScoreBar label="Quantity"        value={route.scores?.quantityScore ?? 0} color="bg-[var(--green-primary)]"     />
                            </div>
                          </div>

                          {/* Legs */}
                          {route.legs?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-2">Leg Details</p>
                              <div className="space-y-1.5">
                                {route.legs.map((leg, li) => (
                                  <div key={li} className="flex items-center justify-between bg-[var(--bg-color-light)] rounded-xl px-3 py-2">
                                    <span className="text-[11px] text-[var(--text-color)] font-medium">Leg {li + 1}</span>
                                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted-text)]">
                                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{leg.distanceKm} km</span>
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{leg.timeMin} min</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer actions */}
                  <div className="px-5 py-3 border-t border-[rgba(0,0,0,0.05)] flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelected(isSelected ? null : idx);
                        console.log(`[SelectRoute] Route ${idx + 1} ${isSelected ? "deselected" : "selected"}:`, route);
                      }}
                      size="sm"
                      className={`flex-1 h-9 text-xs rounded-xl border-0 font-semibold ${
                        isSelected
                          ? "bg-[var(--green-primary)] text-white"
                          : "bg-[var(--bg-color-light)] text-[var(--text-color)] hover:bg-[var(--green-primary)]/10"
                      }`}
                    >
                      {isSelected ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Selected</> : "Select Route"}
                    </Button>
                    {pickupStep?.location?.lat && (
                      <Button
                        onClick={() => openMapsNav(robinInfo?.location, pickupStep.location)}
                        size="sm"
                        variant="outline"
                        className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Navigate
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Start delivery CTA */}
      {selectedRoute !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4">
          <Button onClick={startDelivery} disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white font-bold text-sm border-0 shadow-xl shadow-[var(--green-primary)]/30 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Start Delivery — Route {selectedRoute + 1}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
