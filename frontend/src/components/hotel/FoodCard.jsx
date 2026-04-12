import { Package } from "lucide-react";

export default function FoodCard({ food }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[rgba(0,0,0,0.06)] rounded-2xl p-5 hover:shadow-md hover:border-[rgba(0,0,0,0.1)] transition-all duration-200 group">
      {food.photo ? (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-[var(--bg-color-light)]">
          <img
            src={`data:image/png;base64,${food.photo}`}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-36 rounded-xl mb-4 bg-[var(--bg-color-light)] flex items-center justify-center">
          <Package className="w-8 h-8 text-[var(--muted-text)] opacity-40" />
        </div>
      )}
      <h2 className="text-sm font-bold text-[var(--text-color)] mb-1">{food.name}</h2>
      {food.description && (
        <p className="text-xs text-[var(--muted-text)] mb-3 line-clamp-2">{food.description}</p>
      )}
      <p className="text-xs font-semibold text-[var(--green-primary)]">Qty: {food.quantity}</p>
    </div>
  );
}
