import { X, Home, Utensils, Truck, History } from "lucide-react"
import { motion } from "framer-motion"

export function Sidebar({ open, onClose, setActivePage }) {
  const menuItems = [
    { name: "Feed", icon: <Home size={18} />, action: "feed" },
    { name: "My Requests", icon: <Utensils size={18} />, action: "myRequests" },
  ]

  const handleClick = (action) => {
    setActivePage(action)
    onClose()
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      exit={{ x: -250 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-[var(--bg-color)]/80 backdrop-blur-lg h-full p-6 border-r border-[rgba(255,255,255,0.1)] shadow-lg flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--green-primary)]">Zarfo</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-text)] hover:text-[var(--green-primary)] transition"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(item.action)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--green-primary)] hover:text-[var(--bg-color)] transition cursor-pointer"
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>
    </motion.aside>
  )
}
