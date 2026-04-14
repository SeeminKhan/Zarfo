import { X, Home, ShoppingCart, ClipboardList, ChefHat, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Browse Food",  icon: Home,          action: "feed",      description: "Discover listings" },
  { name: "My Cart",      icon: ShoppingCart,  action: "cart",      description: "Items ready to order" },
  { name: "My Orders",    icon: ClipboardList, action: "myOrders",  description: "Track your orders" },
];

export function Sidebar({ open, onClose, setActivePage, activePage }) {
  const handleClick = (action) => {
    setActivePage(action);
    onClose();
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-72 bg-[var(--card-bg)] h-full flex flex-col border-r border-[rgba(0,0,0,0.07)] shadow-2xl"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--green-primary)] to-[var(--green-dark)] flex items-center justify-center shadow-lg shadow-[var(--green-primary)]/30">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-color)] leading-none tracking-tight">Zarfo</h2>
            <p className="text-[11px] text-[var(--muted-text)] mt-0.5 font-medium">User Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--bg-color-light)] hover:text-[var(--text-color)] transition-all"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] px-3 mb-3">Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.action;
          return (
            <button
              key={item.action}
              onClick={() => handleClick(item.action)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-gradient-to-r from-[var(--green-primary)] to-[var(--green-dark)] text-white shadow-lg shadow-[var(--green-primary)]/25"
                  : "text-[var(--text-color)] hover:bg-[var(--bg-color-light)]"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isActive ? "bg-white/20" : "bg-[var(--green-primary)]/10 group-hover:bg-[var(--green-primary)]/15"
              }`}>
                <Icon size={16} className={isActive ? "text-white" : "text-[var(--green-primary)]"} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold leading-none">{item.name}</p>
                <p className={`text-[10px] mt-0.5 leading-none ${isActive ? "text-white/70" : "text-[var(--muted-text)]"}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[rgba(0,0,0,0.06)]">
        <div className="rounded-2xl bg-gradient-to-br from-[var(--green-primary)]/10 to-[var(--green-primary)]/5 border border-[var(--green-primary)]/15 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--green-primary)]/15 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-[var(--green-primary)]" />
            </div>
            <p className="text-xs font-bold text-[var(--green-primary)]">Surplus Food</p>
          </div>
          <p className="text-[11px] text-[var(--muted-text)] leading-relaxed">
            Every order helps reduce food waste and supports local hotels.
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
