import { Button } from "@/components/ui/button";
import { ShoppingCart, MapPin, Clock, Package, Leaf, Flame, Candy, Zap, Tag, Sparkles, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const getCategoryConfig = (category) => {
  switch (category?.toLowerCase()) {
    case "veg":     return { bg: "bg-green-100 text-green-700 border-green-200",  icon: <Leaf className="w-3 h-3" /> };
    case "non-veg": return { bg: "bg-red-100 text-red-700 border-red-200",        icon: <Flame className="w-3 h-3" /> };
    case "sweet":   return { bg: "bg-pink-100 text-pink-700 border-pink-200",     icon: <Candy className="w-3 h-3" /> };
    case "spicy":   return { bg: "bg-orange-100 text-orange-700 border-orange-200", icon: <Zap className="w-3 h-3" /> };
    default:        return { bg: "bg-gray-100 text-gray-600 border-gray-200",     icon: <Tag className="w-3 h-3" /> };
  }
};

export default function FoodCard({ item, timeLeft, onAddToCart }) {
  const cat = getCategoryConfig(item.category);
  const isExpired = timeLeft[item._id] === "Expired";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-sm hover:shadow-lg transition-all duration-200">
        {/* Image */}
        <div className="relative h-44 bg-[var(--bg-color-light)] overflow-hidden">
          {item.images?.[0] ? (
            <img
              src={`data:image/png;base64,${item.images[0]}`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-[var(--muted-text)] opacity-30" />
            </div>
          )}
          {/* Category badge */}
          <span className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cat.bg}`}>
            {cat.icon}{item.category || "Other"}
          </span>
          {/* Expiry badge */}
          <span className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            isExpired ? "bg-red-100 text-red-600" : "bg-black/50 text-white backdrop-blur-sm"
          }`}>
            <Clock className="w-2.5 h-2.5" />
            {timeLeft[item._id] || "..."}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-[var(--text-color)] line-clamp-1 mb-1">{item.title}</h3>
          {item.description && (
            <p className="text-[11px] text-[var(--muted-text)] line-clamp-2 leading-relaxed mb-3">{item.description}</p>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-text)] mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{item.hotelName}</span>
          </div>

          {/* Price row */}
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
            {item.discountedPrice < item.originalPrice && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--green-primary)] bg-[var(--green-primary)]/10 px-2 py-0.5 rounded-lg">
                <Sparkles className="w-2.5 h-2.5" />AI Price
              </span>
            )}
            <Button
              onClick={() => onAddToCart(item)}
              disabled={isExpired}
              size="sm"
              className="h-8 px-3 text-xs rounded-xl bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white border-0 shadow-sm disabled:opacity-50"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
