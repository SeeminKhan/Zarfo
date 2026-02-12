import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Leaf, Flame } from "lucide-react";

const getCategoryBadge = (category) => {
  const base =
    "px-2 py-0.5 text-[10px] font-semibold rounded-md inline-flex items-center gap-1 shadow-sm";
  switch (category?.toLowerCase()) {
    case "veg":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          <Leaf className="w-3 h-3 text-green-600" />
          {category}
        </span>
      );
    case "non-veg":
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          <Flame className="w-3 h-3 text-red-600" />
          {category}
        </span>
      );
    case "sweet":
      return (
        <span className={`${base} bg-pink-100 text-pink-700`}>
          🍰 {category}
        </span>
      );
    case "spicy":
      return (
        <span className={`${base} bg-orange-100 text-orange-700`}>
          🌶️ {category}
        </span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-700`}>
          {category || "Other"}
        </span>
      );
  }
};

export default function FoodCard({ item, timeLeft, onRequest }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="rounded-2xl overflow-hidden bg-[var(--card-bg)] shadow-md hover:shadow-xl transition-all border border-[rgba(0,0,0,0.05)]">
        <div className="relative">
          <img
            src={
              item.images?.[0]
                ? `data:image/png;base64,${item.images[0]}`
                : "/placeholder.svg"
            }
            alt={item.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            {getCategoryBadge(item.category)}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" /> {item.hotelName}
            </span>
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <Clock className="w-4 h-4" />
              {timeLeft[item._id] || "Calculating..."}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <div className="text-lg font-bold text-[var(--green-primary)]">
                ₹{item.discountedPrice}
              </div>
              <div className="text-xs text-muted-foreground line-through">
                ₹{item.originalPrice}
              </div>
            </div>
            <Button
              onClick={() => onRequest(item)}
              className="bg-[var(--green-primary)] hover:bg-[var(--green-dark)] text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Request
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
