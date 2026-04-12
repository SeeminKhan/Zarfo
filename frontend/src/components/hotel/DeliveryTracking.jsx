import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, Star, IndianRupee, Truck, Package,
  User, CheckCircle2, Navigation, Phone, Heart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DeliveryTracking() {
  const [activeDeliveries] = useState([
    {
      id: "101",
      type: "sale",
      status: "in_transit",
      robinName: "Robin Sharma",
      robinRating: 4.8,
      foodItems: [
        { title: "Paneer Butter Masala", quantity: 2 },
        { title: "Garlic Naan", quantity: 4 },
      ],
      deliveryAddress: "123 Main Street, Mumbai",
      scheduledTime: new Date(),
      totalAmount: 25,
    },
    {
      id: "102",
      type: "donation",
      status: "delivered",
      robinName: "Amit Kumar",
      robinRating: 4.6,
      foodItems: [
        { title: "Veg Biryani", quantity: 1 },
        { title: "Raita", quantity: 2 },
      ],
      deliveryAddress: "456 Park Avenue, Mumbai",
      scheduledTime: new Date(),
    },
  ]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "in_transit":
        return { label: "In Transit", bg: "bg-blue-100 text-blue-700", dot: "bg-blue-500", pulse: true };
      case "delivered":
        return { label: "Delivered", bg: "bg-green-100 text-green-700", dot: "bg-green-500", pulse: false };
      case "pending":
        return { label: "Pending", bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", pulse: true };
      default:
        return { label: status.replace("_", " "), bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400", pulse: false };
    }
  };

  const inTransitCount = activeDeliveries.filter((d) => d.status === "in_transit").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-color)]">Delivery Tracking</h2>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">Monitor your active deliveries in real time</p>
        </div>
        <div className="flex items-center gap-2">
          {inTransitCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700">
                {inTransitCount} in transit
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[rgba(0,0,0,0.07)] rounded-xl px-3 py-2">
            <Truck className="w-3.5 h-3.5 text-[var(--muted-text)]" />
            <span className="text-xs font-semibold text-[var(--text-color)]">
              {activeDeliveries.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="space-y-4">
        {activeDeliveries.map((delivery, idx) => {
          const statusConfig = getStatusConfig(delivery.status);
          const isSale = delivery.type === "sale";
          return (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.25 }}
              className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.06)] rounded-2xl overflow-hidden hover:shadow-md hover:border-[rgba(0,0,0,0.1)] transition-all duration-200"
            >
              {/* Card Header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.05)] ${
                delivery.status === "delivered" ? "bg-green-50/50" : "bg-[var(--bg-color-light)]/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    isSale ? "bg-blue-100" : "bg-emerald-100"
                  }`}>
                    {isSale
                      ? <IndianRupee className="w-4.5 h-4.5 text-blue-600" />
                      : <Heart className="w-4.5 h-4.5 text-emerald-600" />
                    }
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-color)]">
                      Delivery #{delivery.id}
                    </h3>
                    <p className="text-[11px] text-[var(--muted-text)] mt-0.5 capitalize">
                      {isSale ? "Sale order" : "Donation"} &bull; {delivery.robinName}
                    </p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${statusConfig.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${statusConfig.pulse ? "animate-pulse" : ""}`} />
                  {statusConfig.label}
                </span>
              </div>

              {/* Progress Bar for in_transit */}
              {delivery.status === "in_transit" && (
                <div className="px-5 pt-3">
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-text)] mb-1.5">
                    <span className="font-medium">Order Picked Up</span>
                    <span className="font-medium">Delivering</span>
                    <span className="font-medium">Delivered</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-color-light)] rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Food Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-[var(--green-primary)]/10 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Food Items</h5>
                  </div>
                  <div className="space-y-1.5">
                    {delivery.foodItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[var(--bg-color-light)] rounded-xl px-3 py-2">
                        <span className="text-xs text-[var(--text-color)] font-medium truncate">{item.title}</span>
                        <span className="text-[11px] text-[var(--muted-text)] font-bold ml-2 flex-shrink-0 bg-[var(--card-bg)] px-1.5 py-0.5 rounded-lg">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Details */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Delivery Info</h5>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3 text-[var(--muted-text)]" />
                      </div>
                      <span className="text-xs text-[var(--text-color)] leading-relaxed">{delivery.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[var(--bg-color-light)] flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3 h-3 text-[var(--muted-text)]" />
                      </div>
                      <span className="text-xs text-[var(--text-color)]">
                        {new Date(delivery.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {isSale && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <IndianRupee className="w-3 h-3 text-[var(--green-primary)]" />
                        </div>
                        <span className="text-xs font-bold text-[var(--green-primary)]">{delivery.totalAmount}</span>
                      </div>
                    )}
                    {delivery.status === "delivered" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--green-primary)] bg-green-50 px-2.5 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Successfully delivered
                      </div>
                    )}
                  </div>
                </div>

                {/* Robin Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <h5 className="text-[11px] font-bold text-[var(--text-color)] uppercase tracking-wide">Robin Info</h5>
                  </div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--bg-color-light)] rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-color)]">{delivery.robinName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[11px] text-[var(--muted-text)] font-semibold">{delivery.robinRating}</span>
                        <span className="text-[10px] text-[var(--muted-text)]">rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] hover:bg-[var(--bg-color-light)] gap-1.5 font-semibold"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Track
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs rounded-xl border-[rgba(0,0,0,0.1)] hover:bg-[var(--bg-color-light)] gap-1.5 font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {activeDeliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-[var(--muted-text)]">
          <div className="w-20 h-20 rounded-3xl bg-[var(--bg-color-light)] flex items-center justify-center">
            <Truck className="w-10 h-10 opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-color)]">No active deliveries</p>
            <p className="text-xs mt-1">Deliveries will appear here once orders are placed.</p>
          </div>
        </div>
      )}
    </div>
  );
}
