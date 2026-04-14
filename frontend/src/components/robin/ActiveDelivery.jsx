import { useState, useEffect, useRef } from "react";
import {
  MapPin, Clock, Navigation, Phone, Camera, CheckCircle2,
  Package, User, Truck, Loader2, AlertTriangle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "@/lib/api";

export default function ActiveDelivery({ route }) {
  const [delivery, setDelivery]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [pickupLoading, setPickupLoading]     = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [photoUploading, setPhotoUploading]   = useState(false);
  const fileInputRef = useRef(null);

  // Load active delivery from backend on mount (handles page refresh)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/delivery/tasks/active");
        if (data.delivery) {
          console.log("[ActiveDelivery] Resumed active delivery:", data.delivery._id);
          setDelivery(data.delivery);
        } else if (route) {
          // Freshly started from SelectRoute — use the passed route + deliveryId
          console.log("[ActiveDelivery] Using route from SelectRoute:", route);
          setDelivery(route);
        }
      } catch (err) {
        console.error("[ActiveDelivery] Failed to load active delivery:", err.message);
        if (route) setDelivery(route);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openNav = (loc) => {
    if (!loc?.lat) { toast.info("No coordinates available."); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=driving`, "_blank");
  };

  const handleConfirmPickup = async () => {
    const deliveryId = delivery?._id ?? delivery?.deliveryId;
    if (!deliveryId) { toast.error("No delivery ID found."); return; }
    setPickupLoading(true);    try {
      const { data } = await api.post("/delivery/tasks/pickup", { deliveryId });
      console.log("[ActiveDelivery] Pickup confirmed:", data.delivery._id);
      setDelivery((prev) => ({ ...prev, status: "picked_up", _id: data.delivery._id }));
      toast.success("Pickup confirmed! Head to the drop location.");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to confirm pickup";
      console.error("[ActiveDelivery] confirmPickup error:", msg);
      toast.error(msg);
    } finally {
      setPickupLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    const deliveryId = delivery?._id ?? delivery?.deliveryId;
    if (!deliveryId) { toast.error("No delivery ID found."); return; }
    setCompleteLoading(true);
    try {
      const { data } = await api.post("/delivery/tasks/complete", { deliveryId });
      console.log("[ActiveDelivery] Delivery completed:", data.delivery._id);
      setDelivery((prev) => ({ ...prev, status: "delivered" }));
      toast.success("Delivery completed! Great work tonight.");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to complete delivery";
      console.error("[ActiveDelivery] completeDelivery error:", msg);
      toast.error(msg);
    } finally {
      setCompleteLoading(false);
    }
  };

  const handlePhotoUpload = (type) => {
    const deliveryId = delivery?._id ?? delivery?.deliveryId;
    if (!deliveryId) { toast.error("No delivery ID."); return; }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPhotoUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            await api.post("/delivery/tasks/photo", { deliveryId, type, photo: reader.result });
            toast.success(`${type === "pickup" ? "Pickup" : "Delivery"} photo uploaded.`);
          } catch (err) {
            toast.error(err.response?.data?.error || "Failed to upload photo");
          } finally {
            setPhotoUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setPhotoUploading(false);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--green-primary)] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-color)]">Loading delivery...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-color-light)] flex items-center justify-center">
          <Truck className="w-8 h-8 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--text-color)]">No active delivery</p>
          <p className="text-xs mt-1">Select a route from Optimized Routes to begin.</p>
        </div>
      </div>
    );
  }

  const isAssigned  = delivery.status === "assigned";
  const isPickedUp  = delivery.status === "picked_up";
  const isDelivered = delivery.status === "delivered";

  const pickupStep = delivery.steps?.find((s) => s.type === "pickup")
    ?? (delivery.routeSnapshot?.steps?.find((s) => s.type === "pickup"));
  const dropSteps  = delivery.steps?.filter((s) => s.type === "drop")
    ?? (delivery.routeSnapshot?.steps?.filter((s) => s.type === "drop") ?? []);

  const hotelName    = delivery.hotelName    ?? delivery.foodId?.name ?? "Hotel";
  const mealsServed  = delivery.mealsServed  ?? delivery.recipientIds?.length ?? 0;
  const totalDist    = delivery.totalDistance ?? "—";
  const estTime      = delivery.estimatedTime ?? "—";

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Active Delivery</p>
            <h2 className="text-lg font-bold leading-tight">{hotelName}</h2>
            <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
              <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{totalDist} km</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{estTime} min</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{mealsServed} recipients</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.06)] p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-text)] mb-4">Delivery Progress</p>
        <div className="flex items-center">
          {["Assigned", "Picked Up", "Delivered"].map((step, i) => {
            const done   = (i === 0) || (i === 1 && (isPickedUp || isDelivered)) || (i === 2 && isDelivered);
            const active = (i === 0 && isAssigned) || (i === 1 && isPickedUp);
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    done   ? "bg-[var(--green-primary)] text-white" :
                    active ? "bg-blue-500 text-white animate-pulse" :
                             "bg-[var(--bg-color-light)] text-[var(--muted-text)]"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[9px] text-[var(--muted-text)] font-medium whitespace-nowrap">{step}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? "bg-[var(--green-primary)]" : "bg-[var(--bg-color-light)]"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup card */}
      <div className={`bg-[var(--card-bg)] rounded-2xl border overflow-hidden transition-all ${
        isPickedUp || isDelivered ? "border-[var(--green-primary)]/30 opacity-80" : "border-[rgba(0,0,0,0.06)]"
      }`}>
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.05)] ${isPickedUp || isDelivered ? "bg-green-50/50" : "bg-[var(--bg-color-light)]/40"}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPickedUp || isDelivered ? "bg-[var(--green-primary)]" : "bg-[var(--green-primary)]/10"}`}>
            <Package className={`w-4 h-4 ${isPickedUp || isDelivered ? "text-white" : "text-[var(--green-primary)]"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-color)]">Pickup — {hotelName}</p>
            <p className="text-[11px] text-[var(--muted-text)] mt-0.5">
              {pickupStep?.location?.lat ? `${pickupStep.location.lat.toFixed(4)}, ${pickupStep.location.lng.toFixed(4)}` : "Location not available"}
            </p>
          </div>
          {(isPickedUp || isDelivered) && <CheckCircle2 className="w-5 h-5 text-[var(--green-primary)] ml-auto" />}
        </div>
        {isAssigned && (
          <div className="p-5 flex flex-wrap gap-2">
            <Button onClick={() => openNav(pickupStep?.location)} size="sm"
              className="h-9 text-xs rounded-xl bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white border-0 gap-1.5">
              <Navigation className="w-3.5 h-3.5" />Navigate
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5">
              <Phone className="w-3.5 h-3.5" />Call Hotel
            </Button>
            <Button onClick={() => handlePhotoUpload("pickup")} disabled={photoUploading} variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5">
              {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              Photo
            </Button>
            <Button onClick={handleConfirmPickup} disabled={pickupLoading} size="sm"
              className="h-9 text-xs rounded-xl bg-blue-500 hover:bg-blue-600 text-white border-0 gap-1.5">
              {pickupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Pickup
            </Button>
          </div>
        )}
      </div>

      {/* Drop cards */}
      {dropSteps.map((step, i) => (
        <div key={i} className={`bg-[var(--card-bg)] rounded-2xl border overflow-hidden transition-all ${
          !isPickedUp && !isDelivered ? "opacity-50 pointer-events-none" :
          isDelivered ? "border-[var(--green-primary)]/30 opacity-80" : "border-[rgba(0,0,0,0.06)]"
        }`}>
          <div className={`flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.05)] ${isDelivered ? "bg-green-50/50" : "bg-[var(--bg-color-light)]/40"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDelivered ? "bg-[var(--green-primary)]" : "bg-blue-50"}`}>
              <User className={`w-4 h-4 ${isDelivered ? "text-white" : "text-blue-500"}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-color)]">Drop {i + 1}</p>
              <p className="text-[11px] text-[var(--muted-text)] mt-0.5">{step.label}</p>
            </div>
            {isDelivered && <CheckCircle2 className="w-5 h-5 text-[var(--green-primary)] ml-auto" />}
          </div>
          {isPickedUp && !isDelivered && (
            <div className="p-5 flex flex-wrap gap-2">
              <Button onClick={() => openNav(step.location)} size="sm"
                className="h-9 text-xs rounded-xl bg-blue-500 hover:bg-blue-600 text-white border-0 gap-1.5">
                <Navigation className="w-3.5 h-3.5" />Navigate
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5">
                <Phone className="w-3.5 h-3.5" />Call
              </Button>
              <Button onClick={() => handlePhotoUpload("delivery")} disabled={photoUploading} variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] gap-1.5">
                {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                Photo
              </Button>
              {i === dropSteps.length - 1 && (
                <Button onClick={handleCompleteDelivery} disabled={completeLoading} size="sm"
                  className="h-9 text-xs rounded-xl bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white border-0 gap-1.5">
                  {completeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Complete Delivery
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {isDelivered && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--green-primary)]/10 border border-[var(--green-primary)]/20 rounded-2xl p-5 text-center">
          <CheckCircle2 className="w-10 h-10 text-[var(--green-primary)] mx-auto mb-2" />
          <p className="text-sm font-bold text-[var(--text-color)]">Delivery Complete</p>
          <p className="text-xs text-[var(--muted-text)] mt-1">
            You helped feed {mealsServed} recipient{mealsServed !== 1 ? "s" : ""} tonight.
          </p>
        </motion.div>
      )}
    </div>
  );
}
