import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ShoppingCart, Package, Leaf, Flame, Candy, Zap, Tag, IndianRupee, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const getCategoryConfig = (category) => {
  switch (category?.toLowerCase()) {
    case "veg":     return { bg: "bg-green-100 text-green-700 border-green-200",    icon: <Leaf className="w-3 h-3" /> };
    case "non-veg": return { bg: "bg-red-100 text-red-700 border-red-200",          icon: <Flame className="w-3 h-3" /> };
    case "sweet":   return { bg: "bg-pink-100 text-pink-700 border-pink-200",       icon: <Candy className="w-3 h-3" /> };
    case "spicy":   return { bg: "bg-orange-100 text-orange-700 border-orange-200", icon: <Zap className="w-3 h-3" /> };
    default:        return { bg: "bg-gray-100 text-gray-600 border-gray-200",       icon: <Tag className="w-3 h-3" /> };
  }
};

export default function CartPage({ cart, setCart, fetchFood }) {
  const placeOrder = async (item) => {
    try {
      console.log(`[CartPage] Placing order for food: ${item._id} (${item.title})`);
      await api.post("/user/order/create", { foodId: item._id });
      console.log(`[CartPage] Order placed successfully for: ${item._id}`);
      toast.success("Order placed! A robin will deliver it to you.");
      setCart((prev) => prev.filter((i) => i._id !== item._id));
      fetchFood();
    } catch (err) {
      console.error("[CartPage] placeOrder error:", err.message, err);
      toast.error(err.response?.data?.message || err.message || "Failed to place order");
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
    toast.info("Removed from cart");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-[var(--muted-text)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--green-primary)]/10 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-[var(--green-primary)]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-[var(--text-color)]">Your cart is empty</p>
          <p className="text-sm mt-1">Browse the feed and add items to get started.</p>
        </div>
      </div>
    );
  }

  const total = cart.reduce((sum, i) => sum + (i.discountedPrice || 0), 0);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-color)]">Your Cart</h2>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} ready to order</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--green-primary)]/10 border border-[var(--green-primary)]/20 rounded-xl px-3 py-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-[var(--green-primary)]" />
          <span className="text-sm font-black text-[var(--green-primary)]">{total}</span>
          <span className="text-[10px] text-[var(--muted-text)] font-medium">total</span>
        </div>
      </div>

      {/* Cart items */}
      <AnimatePresence mode="popLayout">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cart.map((item) => {
            const cat = getCategoryConfig(item.category);
            return (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--card-bg)] rounded-2xl border border-[rgba(0,0,0,0.06)] overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                {/* Image */}
                <div className="relative h-40 bg-[var(--bg-color-light)] overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={`data:image/png;base64,${item.images[0]}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-[var(--muted-text)] opacity-30" />
                    </div>
                  )}
                  <span className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cat.bg}`}>
                    {cat.icon}{item.category || "Other"}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-[var(--text-color)] line-clamp-1 mb-2">{item.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--muted-text)] mb-3">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{item.hotelName}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0 text-orange-500">
                      <Clock className="w-3 h-3" />
                      {item.expiryTime
                        ? new Date(item.expiryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(0,0,0,0.05)]">
                    <div>
                      <div className="flex items-center gap-0.5 text-base font-black text-[var(--green-primary)]">
                        <IndianRupee className="w-3.5 h-3.5" />{item.discountedPrice}
                      </div>
                      {item.originalPrice !== item.discountedPrice && (
                        <div className="flex items-center gap-0.5 text-[10px] text-[var(--muted-text)] line-through">
                          <IndianRupee className="w-2.5 h-2.5" />{item.originalPrice}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => placeOrder(item)}
                      size="sm"
                      className="h-8 px-3 text-xs rounded-xl bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white border-0"
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
